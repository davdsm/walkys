import type { Route } from "../+types/root";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useParams } from "react-router";
import { LoginForm } from "~/components/Forms/LoginForm";
import { SignupForm } from "~/components/Forms/SignupForm";

import { redirect, data, useLoaderData } from "react-router";
import { createPocketBase, createPocketBaseAsAdmin, canAccessUserBackoffice, getUserBlockedStatus, buildAuthCookie } from "~/lib/pocketbase";
import { buildSeoMeta } from "~/lib/seo";
import { issueAntiBotToken, verifyAntiBot } from "~/lib/antibot";
import { createNotification } from "~/lib/services";
import { getAdminEmail, getLanguageFromRequest, sendEmail, buildNewUserAdmin } from "~/lib/email";

export async function loader({ request, params }: Route.LoaderArgs) {
  const pb = createPocketBase(request);

  if (pb.authStore.isValid) {
    const user = pb.authStore.model as { id?: string; admin?: boolean } | null;
    if (user?.admin === true) return redirect("/backoffice");
    if (user?.id && (await getUserBlockedStatus(pb, user))) return redirect("/blocked");
    if (user?.id && !(await canAccessUserBackoffice(pb, user))) return redirect("/pending-approval");
    return redirect("/");
  }

  const mode = params.mode || "login";
  if (!["login", "register"].includes(mode)) {
    return redirect("/auth/login");
  }

  return { antiBot: issueAntiBotToken() };
}

export async function action({ request }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  const formData = await request.formData();

  const mode = (formData.get("mode") as string) || "login";

  try {
    if (mode === "register") {
      const antiBot = verifyAntiBot(formData, request, {
        context: "register",
        maxPerWindow: 3,
        windowMs: 10 * 60 * 1000,
      });
      if (!antiBot.ok) {
        if (antiBot.reason === "honeypot") {
          // Silently pretend success so bots think it worked.
          return redirect("/registration-success");
        }
        if (antiBot.reason === "rate_limited") {
          return data(
            { error: "Too many attempts. Please try again later." },
            { status: 429 }
          );
        }
        return data(
          { error: "Could not validate request. Please reload the page and try again." },
          { status: 400 }
        );
      }

      const email = (formData.get("email") as string)?.trim();
      const fullName = (formData.get("fullName") as string)?.trim();
      const password = formData.get("password") as string;
      const passwordConfirm = (formData.get("confirmPassword") ?? formData.get("passwordConfirm")) as string;

      if (!email || !fullName) {
        return data(
          { error: "Name and email are required" },
          { status: 400 }
        );
      }
      if (!password || password.length < 8) {
        return data(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      if (password !== passwordConfirm) {
        return data(
          { error: "Passwords do not match" },
          { status: 400 }
        );
      }

      // Use admin client so creation is not blocked by users collection API rules.
      const client = (await createPocketBaseAsAdmin()) ?? pb;
      const payload: Record<string, unknown> = {
        email,
        password,
        passwordConfirm,
        name: fullName,
        admin: false,
      };
      let createdUserId: string | null = null;
      try {
        payload.approved = false;
        const created = await client.collection("users").create(payload);
        createdUserId = created.id;
      } catch (firstErr: unknown) {
        delete payload.approved;
        try {
          const created = await client.collection("users").create(payload);
          createdUserId = created.id;
        } catch (createErr: unknown) {
          const err = createErr as { response?: { data?: Record<string, unknown>; message?: string }; message?: string };
          const msg =
            (err?.response?.message ??
              (typeof (createErr as { message?: string }).message === "string" ? (createErr as { message: string }).message : "")) ||
            "Failed to create record.";
          const dataFields = err?.response?.data && typeof err.response.data === "object" && Object.keys(err.response.data).length > 0
            ? " " + JSON.stringify(err.response.data)
            : "";
          console.error("Register create error:", createErr);
          return data(
            { error: msg + dataFields + " (Check PocketBase: users collection → API rules → Create must allow new signups, or set API_PB_ADMIN_EMAIL/PASSWORD so the app creates as admin.)" },
            { status: 400 }
          );
        }
      }

      if (createdUserId) {
        try {
          await createNotification(client, {
            type: "user_registered",
            user: null,
            payload: { userId: createdUserId, email },
          });
        } catch (notifErr) {
          console.error("[register] notification create failed:", notifErr);
        }

        const adminTo = getAdminEmail();
        if (adminTo) {
          try {
            const lang = getLanguageFromRequest(request);
            const { subject: adminSubject, html: adminHtml } = buildNewUserAdmin(lang, email, createdUserId);
            await sendEmail(adminTo, adminSubject, adminHtml);
          } catch (mailErr) {
            console.error("[register] admin email failed:", mailErr);
          }
        }
      }

      return redirect("/registration-success");
    }

    // Default: login
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await pb.collection("users").authWithPassword(email, password);

    const user = pb.authStore.model as { id?: string; admin?: boolean } | null;
    const isAdmin = user?.admin === true;
    const isBlocked = await getUserBlockedStatus(pb, user);
    const canAccess = !isBlocked && (await canAccessUserBackoffice(pb, user));
    const redirectTo = isAdmin ? "/backoffice" : isBlocked ? "/blocked" : canAccess ? "/?success=login" : "/pending-approval";
    return redirect(redirectTo, {
      headers: {
        "set-cookie": buildAuthCookie(pb, request),
      },
    });
  } catch (error: any) {
    console.error("Auth Error:", error);
    return data(
      {
        error:
          error.originalError?.message ||
          error.message ||
          "Something went wrong",
      },
      { status: 400 }
    );
  }
}

export function meta({ params }: Route.MetaArgs) {
  const isRegister = params.mode === "register";

  return buildSeoMeta({
    title: isRegister ? "Create Account" : "Login",
    description: isRegister
      ? "Create your Walkys account to access collections, orders, and your customer area."
      : "Sign in to your Walkys account to manage orders and access your customer area.",
    pathname: isRegister ? "/auth/register" : "/auth/login",
    noIndex: true,
  });
}

export const Auth = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { mode } = useParams();
  const isRegister = mode === "register";
  const loaderData = useLoaderData<typeof loader>() as { antiBot?: { honeypotField: string; tokenField: string; token: string } } | null;
  const antiBot = loaderData?.antiBot;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full max-w-full bg-white min-h-[100dvh] md:h-screen md:min-h-0 relative flex items-center justify-center font-sans overflow-x-hidden md:overflow-hidden">
      {/* Mobile Background */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute top-0 left-0 w-full h-full md:hidden z-0"
      >
        <video
          src="/videos/about.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Desktop Background Wrapper (White) */}
      <div className="w-full h-full md:p-4 flex items-center justify-center relative z-10">
        <div className="w-full h-full max-w-[1600px] md:bg-white overflow-hidden flex flex-col md:flex-row relative">
          {/* Left Side - Animated Background (Desktop Only) - STATIC */}
          <motion.div
            initial={{ opacity: 0, translateX: "-50vw" }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ duration: 1.5, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full md:w-1/2 h-full relative overflow-hidden hidden md:block rounded-3xl"
          >
            <video
              src="/videos/about.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10" />

            <div className="absolute top-12 left-12 z-20 flex items-center gap-4">
              <span className="text-white/80 text-xs font-bold tracking-widest uppercase">
                A Wise Quote
              </span>
              <div className="h-[1px] w-16 bg-white/40"></div>
            </div>

            <div className="absolute bottom-20 left-12 z-20 max-w-md text-white">
              <h1 className="text-6xl font-display mb-6 leading-tight">
                Get
                <br />
                Everything
                <br />
                You Want
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">
                You can get everything you want if you work hard, trust the
                process, and stick to the plan.
              </p>
            </div>
          </motion.div>

          {/* Right Side - Form Container (Card on Mobile, Panel on Desktop) */}
          <motion.div
            key={isMobile ? "mobile" : "desktop"}
            initial={{
              opacity: isMobile ? 0 : 1,
              y: isMobile ? 40 : 0,
              x: isMobile ? 0 : "-30vw",
            }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full md:w-1/2 h-full flex items-end md:items-center justify-center p-4 md:p-16"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md bg-white rounded-[20px] p-6 sm:p-8 md:p-0 mx-auto"
            >
              {isRegister ? <SignupForm antiBot={antiBot} /> : <LoginForm />}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
