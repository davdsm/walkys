import type { Route } from "../+types/root";
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useSubmit, useActionData, useNavigation } from "react-router";
import { motion } from "motion/react";
import UseAnimations from "react-useanimations";
import checkBox from "react-useanimations/lib/checkBox";
import { AnimatedEye } from "~/components/Elements/AnimatedEye/AnimatedEye";
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

export async function action({ request, params }: Route.ActionArgs) {
    const pb = createPocketBase(request);
    const formData = await request.formData();
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("confirmPassword") as string;
    const token = params.token;

    if (!token) {
        return data({ error: "Invalid token" }, { status: 400 });
    }

    try {
        await pb.collection("users").confirmPasswordReset(token, password, passwordConfirm);
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
        { title: "Walkys - Reset Password" },
        { name: "description", content: "Set a new password for your account" },
    ];
}

interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    password?: string;
    confirmPassword?: string;
}

interface ActionData {
    success?: boolean;
    error?: string;
}

export const ResetPassword = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const submit = useSubmit();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState<ResetPasswordFormData>({
        password: "",
        confirmPassword: "",
    });
    const [clientError, setClientError] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (actionData?.success) {
            setSuccess(true);
        }
    }, [actionData]);

    useEffect(() => {
        if (success) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate("/auth/login");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [success, navigate]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (clientError) setClientError("");
        if (actionData?.error) {
            // Clear action error if user starts typing again
            // This is a simplified approach, a more robust solution might involve
            // clearing actionData or using a separate state for action errors.
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.password) {
            setClientError(t.errors.passwordRequired);
            return;
        }

        if (formData.password.length < 8) {
            setClientError(t.errors.passwordMinLength8);
            return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            setClientError(t.errors.passwordRequirements);
            return;
        }

        if (!formData.confirmPassword) {
            setClientError(t.errors.confirmPasswordRequired);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setClientError(t.errors.passwordsNotMatch);
            return;
        }

        submit(formData as any, { method: "post" });
    };

    if (success) {
        return (
            <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white rounded-2xl p-8"
                >
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                            {typeof window !== 'undefined' && (
                                <UseAnimations
                                    animation={checkBox}
                                    size={60}
                                    strokeColor="#10B981"
                                    autoplay
                                />
                            )}
                        </div>

                        <div>
                            <p className="text-2xl font-bold mb-2">{t.resetPassword.success}</p>
                            <p className="text-gray-600 text-sm">
                                {t.resetPassword.successMessage}
                            </p>
                        </div>

                        <p className="text-sm text-gray-500">
                            {t.resetPassword.redirecting}
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl p-8"
            >
                <div className="mb-8">
                    <p className="text-2xl font-bold mb-2">{t.resetPassword.title}</p>
                    <p className="text-gray-600 text-sm">
                        {t.resetPassword.subtitle}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label={t.resetPassword.newPassword}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={t.resetPassword.newPasswordPlaceholder}
                        error={clientError || actionData?.error}
                        required
                        rightIcon={<AnimatedEye isVisible={showPassword} onClick={() => setShowPassword(!showPassword)} />}
                    />

                    <Input
                        label={t.resetPassword.confirmPassword}
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder={t.resetPassword.confirmPasswordPlaceholder}
                        error={clientError || actionData?.error}
                        required
                        rightIcon={<AnimatedEye isVisible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full mt-6"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t.resetPassword.resetting : t.resetPassword.resetPassword}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
