import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLanguage } from "~/contexts";
import { Input } from "../Elements/Input/Input";
import { Button } from "../Elements/Button/Button";

export const ContactForm = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        company: "",
        email: "",
        message: ""
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log("Form Data:", formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl md:max-w-[1200px] mx-auto px-4 font-sans md:grid md:grid-cols-2 md:gap-x-32 md:items-start">
            <div className="mb-16 md:mb-0 md:col-start-1 md:row-start-1">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 uppercase">
                    {t.contact.title}
                </h1>
                <a href={`mailto:${t.contact.email}`} className="text-gray-500 hover:text-black transition-colors text-lg">
                    {t.contact.email}
                </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12 md:col-start-2 md:row-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                    <Input
                        label={t.contact.name}
                        name="name"
                        placeholder={t.contact.namePlaceholder}
                        variant="minimal"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <Input
                        label={t.contact.subject}
                        name="subject"
                        placeholder={t.contact.subjectPlaceholder}
                        variant="minimal"
                        value={formData.subject}
                        onChange={handleChange}
                    />
                    <Input
                        label={t.contact.company}
                        name="company"
                        placeholder={t.contact.companyPlaceholder}
                        variant="minimal"
                        value={formData.company}
                        onChange={handleChange}
                    />
                    <Input
                        label={t.contact.emailLabel}
                        name="email"
                        type="email"
                        placeholder={t.contact.emailPlaceholder}
                        variant="minimal"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-base font-bold text-black">
                        {t.contact.message}
                    </label>
                    <textarea
                        name="message"
                        placeholder={t.contact.messagePlaceholder}
                        value={formData.message}
                        onChange={handleChange}
                        rows={1}
                        className="w-full bg-transparent border-b border-gray-200 rounded-none px-0 py-2 focus:border-black placeholder:text-gray-400/60 outline-none resize-none transition-all min-h-[40px]"
                        style={{ fieldSizing: "content" } as any}
                    />
                </div>

                <div className="pt-8">
                    <Button
                        type="submit"
                        variant="primary"
                        className="primary"
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                        {t.contact.submit}
                    </Button>
                </div>
            </form>

            <div className="mt-32 md:mt-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:col-start-1 md:row-start-2 md:self-end">
                <div>
                    <h3 className="font-bold mb-6 uppercase text-sm tracking-wider">{t.contact.findUs}</h3>
                    <div className="flex gap-6 text-gray-500 font-bold text-sm tracking-widest">
                        <span>FB</span>
                        <span>IG</span>
                        <span>IN</span>
                    </div>
                </div>
                <div className="md:text-right">
                    <h3 className="font-bold mb-2 text-lg">{t.contact.address}</h3>
                    <p className="text-gray-500 text-lg">{t.contact.phone}</p>
                </div>
            </div>
        </div>
    );
};
