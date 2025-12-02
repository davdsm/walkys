import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useSubmit, useActionData, useNavigation } from "react-router";
import { Calendar } from "lucide-react";
import { AnimatedEye } from "~/components/Elements/AnimatedEye/AnimatedEye";
import { Button } from "~/components/Elements/Button/Button";
import { Input } from "~/components/Elements/Input/Input";
import { useLanguage } from "~/contexts";

interface SignupFormData {
    fullName: string;
    email: string;
    password: string;
    repeatPassword: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    repeatPassword?: string;
}

export const SignupForm = () => {
    const { t } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [formData, setFormData] = useState<SignupFormData>({
        fullName: "",
        email: "",
        password: "",
        repeatPassword: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const submit = useSubmit();
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = t.errors.fullNameRequired;
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = t.errors.fullNameRequired;
        }

        if (!formData.email) {
            newErrors.email = t.errors.emailRequired;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t.errors.emailInvalid;
        }

        if (!formData.password) {
            newErrors.password = t.errors.passwordRequired;
        } else if (formData.password.length < 8) {
            newErrors.password = t.errors.passwordMinLength8;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = t.errors.passwordRequirements;
        }

        if (!formData.repeatPassword) {
            newErrors.repeatPassword = t.errors.confirmPasswordRequired;
        } else if (formData.password !== formData.repeatPassword) {
            newErrors.repeatPassword = t.errors.passwordsNotMatch;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
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
            <div className="text-center md:text-left mb-2">
                <span className="text-3xl md:text-4xl mb-2 font-bold">{t.signup.title}</span>
                <p className="text-gray-500 text-sm mt-2">{t.signup.subtitle}</p>
                {actionData?.error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {actionData.error}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                    label={t.signup.fullName}
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={t.signup.fullNamePlaceholder}
                    error={errors.fullName}
                    required
                />

                <Input
                    label={t.signup.email}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t.signup.emailPlaceholder}
                    error={errors.email}
                    required
                />

                <Input
                    label={t.signup.password}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t.signup.passwordPlaceholder}
                    error={errors.password}
                    required
                    rightIcon={<AnimatedEye isVisible={showPassword} onClick={() => setShowPassword(!showPassword)} />}
                />

                <Input
                    label={t.signup.confirmPassword}
                    type={showRepeatPassword ? "text" : "password"}
                    name="repeatPassword"
                    value={formData.repeatPassword}
                    onChange={handleInputChange}
                    placeholder={t.signup.confirmPasswordPlaceholder}
                    error={errors.repeatPassword}
                    required
                    rightIcon={<AnimatedEye isVisible={showRepeatPassword} onClick={() => setShowRepeatPassword(!showRepeatPassword)} />}
                />

                <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 py-6"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? t.signup.signingUp : t.signup.signUp}
                </Button>
            </form>

            <div className="text-center text-sm text-gray-500 mt-4">
                {t.signup.haveAccount} <Link to="/auth/login" className="text-black font-bold hover:underline">{t.signup.signIn}</Link>
            </div>
        </div>
    );
};
