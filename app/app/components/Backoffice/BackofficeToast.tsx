import { useState, useEffect } from "react";

export type ToastActionData = { ok?: boolean; error?: string } | undefined;

interface BackofficeToastProps {
  /** From useActionData() after form submit */
  actionData?: ToastActionData;
  /** Optional: show success when searchParams has success=1 (e.g. after redirect) */
  successParam?: string | null;
  /** Optional: show error when searchParams has error=... */
  errorParam?: string | null;
  /** Success message when ok === true */
  successMessage?: string;
  /** Auto-dismiss after ms (0 = no auto-dismiss) */
  dismissAfter?: number;
}

export function BackofficeToast({
  actionData,
  successParam,
  errorParam,
  successMessage = "Guardado com sucesso",
  dismissAfter = 4000,
}: BackofficeToastProps) {
  const [show, setShow] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (actionData !== undefined && actionData !== null) {
      if (actionData.ok === true) {
        setShow(true);
        setIsSuccess(true);
        setMessage(successMessage);
      } else if (actionData.ok === false) {
        setShow(true);
        setIsSuccess(false);
        setMessage(actionData.error ?? "Erro ao guardar");
      }
    }
  }, [actionData, successMessage]);

  useEffect(() => {
    if (successParam != null && successParam !== "") {
      setShow(true);
      setIsSuccess(true);
      setMessage(successMessage);
    }
  }, [successParam, successMessage]);

  useEffect(() => {
    if (errorParam != null && errorParam !== "") {
      setShow(true);
      setIsSuccess(false);
      setMessage(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  useEffect(() => {
    if (!show || dismissAfter <= 0) return;
    const t = setTimeout(() => setShow(false), dismissAfter);
    return () => clearTimeout(t);
  }, [show, dismissAfter]);

  if (!show) return null;

  return (
    <div
      role="alert"
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] px-5 py-3 rounded-sm font-medium text-sm shadow-lg text-white ${isSuccess ? "bg-slate-800" : "bg-red-700"}`}
    >
      {message}
    </div>
  );
}
