import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useLanguage } from "~/contexts";

const TOAST_DURATION_MS = 4000;

export function LoginSuccessToast() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (searchParams.get("success") === "login") {
      setShow(true);
      const timeout = setTimeout(() => setShow(false), TOAST_DURATION_MS);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("success");
        return next;
      }, { replace: true });
      return () => clearTimeout(timeout);
    }
  }, [searchParams, setSearchParams]);

  if (!show) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] px-5 py-3 rounded-lg font-medium text-sm shadow-lg text-white bg-emerald-600"
    >
      {t.login?.successMessage ?? "You have logged in successfully."}
    </div>
  );
}
