import type { Route } from "../+types/root";
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useSubmit, useActionData, useNavigation } from "react-router";
import { Mail } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "~/components/Elements/Button/Button";
import { Input } from "~/components/Elements/Input/Input";
import { useLanguage } from "~/contexts";

import { data, redirect } from "react-router";
import { createPocketBase } from "~/lib/pocketbase";

export async function loader({ request }: Route.LoaderArgs) {
    const pb = createPocketBase(request);

    // If user is already authenticated, redirect to dashboard
    if (pb.authStore.isValid) {
        return redirect("/dashboard");
    }

    return null;
}

export async function action({ request }: Route.ActionArgs) {
    const pb = createPocketBase(request);
    const formData = await request.formData();
    const email = formData.get("email") as string;

    try {
        await pb.collection("users").requestPasswordReset(email);
        return data({ success: true });
    } catch (error: any) {
        return data(
            { error: error.originalError?.message || error.message || "Something went wrong" },
            { status: 400 }
        );
    }
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "AskNicely - Forgot Password" },
        { name: "description", content: "Reset your AskNicely account password" },
    ];
}

interface ForgotPasswordFormData {
    email: string;
}

export const ForgotPassword = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const submit = useSubmit();
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: "" });
    const [clientError, setClientError] = useState<string>("");
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        if (actionData?.success) {
            setEmailSent(true);
        }
    }, [actionData]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ email: e.target.value });
        if (clientError) setClientError("");
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.email) {
            setClientError(t.errors.emailRequired);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setClientError(t.errors.emailInvalid);
            return;
        }

        submit(formData as any, { method: "post" });
    };

    const handleResendEmail = () => {
        submit(formData as any, { method: "post" });
    };

    if (emailSent) {
        return (
            <div className="w-full min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white rounded-2xl p-8"
                >
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-teal-600" />
                        </div>

                        <div>
                            <p className="text-2xl font-bold mb-2">{t.forgotPassword.emailSent}</p>
                            <p className="text-gray-600 text-sm">
                                {t.forgotPassword.emailSentMessage} <span className="font-semibold text-black">{formData.email}</span>.
                                {t.forgotPassword.checkInbox}
                            </p>
                        </div>

                        <div className="w-full space-y-3">
                            <p className="text-sm text-gray-600">
                                {t.forgotPassword.didNotReceive}{" "}
                                <button
                                    onClick={handleResendEmail}
                                    disabled={isSubmitting}
                                    className="text-black font-semibold hover:underline"
                                >
                                    {t.forgotPassword.resendEmail}
                                </button>
                            </p>

                            <p className="text-sm text-gray-600">
                                {t.forgotPassword.wrongEmail}{" "}
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="text-black font-semibold hover:underline"
                                >
                                    {t.forgotPassword.changeEmail}
                                </button>
                            </p>
                        </div>

                        <Link to="/auth/login" className="text-sm text-gray-600 hover:text-black">
                            {t.forgotPassword.backToLogin}
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl p-8"
            >
                <div className="mb-8">
                    <p className="text-2xl font-bold mb-2">{t.forgotPassword.title}</p>
                    <p className="text-gray-600 text-sm">
                        {t.forgotPassword.subtitle}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label={t.forgotPassword.email}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t.forgotPassword.emailPlaceholder}
                        error={clientError || actionData?.error}
                        required
                        leftIcon={<Mail size={18} className="text-gray-400" />}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t.forgotPassword.sending : t.forgotPassword.sendEmail}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {t.forgotPassword.rememberPassword}{" "}
                    <Link to="/auth/login" className="font-semibold hover:underline">
                        {t.forgotPassword.login}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
