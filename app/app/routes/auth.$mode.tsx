import type { Route } from "../+types/root";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LoginForm } from "~/components/Forms/LoginForm";

import { redirect, data } from "react-router";
import { createPocketBase } from "~/lib/pocketbase";

export async function loader({ request, params }: Route.LoaderArgs) {
  const pb = createPocketBase(request);

  if (pb.authStore.isValid) {
    const user = pb.authStore.model as { admin?: boolean } | null;
    return redirect(user?.admin === true ? "/backoffice" : "/dashboard");
  }

  if (params.mode && params.mode !== "login") {
    return redirect("/auth/login");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  const formData = await request.formData();

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await pb.collection("users").authWithPassword(email, password);

    const user = pb.authStore.model as { admin?: boolean } | null;
    const isAdmin = user?.admin === true;
    const redirectTo = isAdmin ? "/backoffice" : "/dashboard";
    return redirect(redirectTo, {
      headers: {
        "set-cookie": pb.authStore.exportToCookie({ httpOnly: true, secure: import.meta.env.PROD }),
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

export function meta() {
  return [
    { title: "Walkys - Login" },
    { name: "description", content: "Login to your Walkys account" },
  ];
}

export const Auth = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full bg-white h-screen relative flex items-center justify-center font-sans overflow-hidden">
      {/* Mobile Background */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute top-0 left-0 w-full h-full md:hidden z-0"
      >
        <video
          src="/videos/login.mp4"
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
              src="/videos/login.mp4"
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
              <h1 className="text-6xl font-serif mb-6 leading-tight">
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
              className="w-full max-w-md bg-white rounded-[20px] p-12 md:p-0"
            >
              <LoginForm />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
