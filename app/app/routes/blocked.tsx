import { redirect, Link, Form } from "react-router";
import { motion } from "motion/react";
import { createPocketBase, canAccessUserBackoffice, getUserBlockedStatus } from "~/lib/pocketbase";
import type { Route } from "./+types/blocked";
import { useLanguage } from "~/contexts";

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return redirect("/auth/login");

  const user = pb.authStore.model as { id?: string; admin?: boolean } | null;
  if (user?.admin === true) return redirect("/backoffice");
  if (user?.id && !(await getUserBlockedStatus(pb, user))) {
    if (await canAccessUserBackoffice(pb, user)) return redirect("/dashboard");
    return redirect("/pending-approval");
  }

  return null;
}

export function meta() {
  return [{ title: "Conta bloqueada – Walkys" }];
}

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export default function Blocked() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div
        className="max-w-md w-full text-center space-y-6"
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={fadeInUp.transition}
      >
        <motion.div
          className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </motion.div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.blocked?.title ?? "Conta bloqueada"}
        </h1>
        <p className="text-slate-600">
          {t.blocked?.message ??
            "O acesso à sua conta foi bloqueado. Contacte o suporte se achar que isto é um erro."}
        </p>
        <motion.div
          className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 font-medium text-sm focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {t.blocked?.goToHome ?? "Ir ao início"}
          </Link>
          <Form method="post" action="/logout">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-slate-300 text-slate-700 rounded-sm hover:bg-slate-50 font-medium text-sm focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              {t.blocked?.logout ?? "Terminar sessão"}
            </button>
          </Form>
        </motion.div>
      </motion.div>
    </div>
  );
}
