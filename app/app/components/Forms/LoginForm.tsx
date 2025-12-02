import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useSubmit, useActionData, useNavigation } from "react-router";
import { AnimatedEye } from "~/components/Elements/AnimatedEye/AnimatedEye";
import { AnimatedCheckbox } from "~/components/Elements/AnimatedCheckbox/AnimatedCheckbox";
import { Button } from "~/components/Elements/Button/Button";
import { Input } from "~/components/Elements/Input/Input";
import { useLanguage } from "~/contexts";

interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface FormErrors {
    email?: string;
    password?: string;
}

export const LoginForm = () => {
    const { t } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const submit = useSubmit();
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.email) {
            newErrors.email = t.errors.emailRequired;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t.errors.emailInvalid;
        }

        if (!formData.password) {
            newErrors.password = t.errors.passwordRequired;
        } else if (formData.password.length < 6) {
            newErrors.password = t.errors.passwordMinLength;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        submit(formData as any, { method: "post" });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 self-start mb-4 hidden md:block">
                <Link to="/">
                    <h2 className="font-medium text-lg">AskNicely</h2>
                </Link>
            </div>

            <div className="text-center md:text-left mb-2">
                <span className="text-3xl md:text-4xl mb-2 font-bold">{t.login.title}</span>
                <p className="text-gray-500 text-sm mt-2">{t.login.subtitle}</p>
                {actionData?.error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {actionData.error}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                    label={t.login.email}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t.login.emailPlaceholder}
                    error={errors.email}
                    required
                />

                <Input
                    label={t.login.password}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t.login.passwordPlaceholder}
                    error={errors.password}
                    required
                    rightIcon={<AnimatedEye isVisible={showPassword} onClick={() => setShowPassword(!showPassword)} />}
                />

                <div className="flex items-center justify-between text-sm">
                    <AnimatedCheckbox
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        label={t.login.rememberMe}
                    />
                    <Link to="/forgot-password" className="w-1/2 text-gray-600 hover:text-black font-medium text-right">{t.login.forgotPassword}</Link>
                </div>

                <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 py-6"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? t.login.signingIn : t.login.signIn}
                </Button>
            </form>

            <div className="text-center text-sm text-gray-500 mt-4">
                {t.login.noAccount} <Link to="/auth/signup" className="text-black font-bold hover:underline">{t.login.signUp}</Link>
            </div>

            <Link to="/" className="text-center text-xs text-gray-500 underline">{t.login.backToHome}</Link>
        </div>
    );
};
