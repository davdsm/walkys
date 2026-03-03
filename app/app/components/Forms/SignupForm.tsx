import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, Form, useActionData, useNavigation } from "react-router";
import { Button } from "~/components/Elements/Button/Button";
import { Input } from "~/components/Elements/Input/Input";
import { useLanguage } from "~/contexts";

interface SignupFormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export const SignupForm = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<SignupFormData>({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
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
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t.errors.confirmPasswordRequired;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t.errors.passwordsNotMatch;
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
        if (!validateForm()) {
            e.preventDefault();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="text-center md:text-left mb-2">
                <span className="text-3xl md:text-4xl mb-2 font-bold font-display">{t.signup.title}</span>
                <p className="text-gray-500 text-sm mt-2">{t.signup.subtitle}</p>
                {actionData?.error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {actionData.error}
                    </div>
                )}
            </div>

            <Form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <input type="hidden" name="mode" value="register" />
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
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t.signup.passwordPlaceholder}
                    error={errors.password}
                    required
                    minLength={8}
                    autoComplete="new-password"
                />

                <Input
                    label={t.signup.confirmPassword}
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={t.signup.confirmPasswordPlaceholder}
                    error={errors.confirmPassword}
                    required
                    minLength={8}
                    autoComplete="new-password"
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
            </Form>

            <div className="text-center text-sm text-gray-500 mt-4">
                {t.signup.haveAccount} <Link to="/auth/login" className="text-black font-bold hover:underline">{t.signup.signIn}</Link>
            </div>
        </div>
    );
};
