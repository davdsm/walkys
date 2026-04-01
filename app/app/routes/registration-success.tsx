import { Link } from "react-router";
import type { Route } from "./+types/registration-success";
import { useLanguage } from "~/contexts";
import { buildSeoMeta } from "~/lib/seo";

export function meta({}: Route.MetaArgs) {
  return buildSeoMeta({
    title: "Account Created",
    description: "Your Walkys account has been created and is awaiting approval.",
    pathname: "/registration-success",
    noIndex: true,
  });
}

export default function RegistrationSuccess() {
  const { t } = useLanguage();
  const rs = t.registrationSuccess;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="rounded-full bg-emerald-100 w-16 h-16 flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {rs?.title ?? "Account created successfully"}
        </h1>
        <p className="text-slate-600 font-medium">
          {rs?.intro ?? "Thank you for registering."}
        </p>
        <div className="text-slate-600 space-y-2 text-left bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p>
            {rs?.review ??
              "Your account will be reviewed by our team and will be accepted soon."}
          </p>
          <p>
            {rs?.access ??
              "Only after approval will you be able to access the backoffice (members area) to manage your profile and orders."}
          </p>
        </div>
        <div className="pt-4">
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 font-medium text-sm"
          >
            {rs?.goToLogin ?? "Go to login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
