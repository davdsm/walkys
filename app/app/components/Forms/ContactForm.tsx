import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "~/contexts";
import { Input } from "../Elements/Input/Input";
import { Button } from "../Elements/Button/Button";
import confetti from "canvas-confetti";

export const ContactForm = () => {
  const { t } = useLanguage();
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    company: "",
    email: "",
    message: "",
  });

  const isSubmitting = fetcher.state === "submitting";
  const submitStatus =
    fetcher.data?.ok === true
      ? "success"
      : fetcher.data?.ok === false
        ? "error"
        : "idle";

  useEffect(() => {
    if (fetcher.data?.ok === true) {
      setFormData({ name: "", subject: "", company: "", email: "", message: "" });
      const button = document.getElementById("contact-submit-btn");
      if (button) {
        const rect = button.getBoundingClientRect();
        const x = (rect.left + rect.right) / 2 / window.innerWidth;
        const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
        confetti({ particleCount: 100, spread: 70, origin: { x, y } });
      }
    }
  }, [fetcher.data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <article className="w-full max-w-4xl md:max-w-[1200px] mx-auto px-4 sm:px-6 font-sans md:grid md:grid-cols-2 md:gap-x-32 md:items-start">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        className="mb-12 md:mb-0 md:col-start-1 md:row-start-1"
      >
        <h1 className="text-3xl sm:text-4xl md:text-6xl leading-tight font-bold mb-4 uppercase font-display break-words">
          {t.contact.title}
        </h1>
        <a
          href={`mailto:${t.contact.email}`}
          className="text-gray-500 hover:text-black transition-colors text-base sm:text-lg break-all"
        >
          {t.contact.email}
        </a>
      </motion.div>

      <fetcher.Form
        method="post"
        className="space-y-8 sm:space-y-12 md:col-start-2 md:row-span-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 sm:gap-y-12">
          <Input
            label={t.contact.name}
            name="name"
            placeholder={t.contact.namePlaceholder}
            variant="minimal"
            value={formData.name}
            onChange={handleChange}
            required
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
            required
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
            required
            className="w-full bg-transparent border-b border-gray-200 rounded-none px-0 py-2 focus:border-black placeholder:text-gray-400/60 outline-none resize-none transition-all min-h-[40px]"
            style={{ fieldSizing: "content" } as any}
          />
        </div>

        <div className="pt-6 sm:pt-8 flex flex-col gap-4">
          <Button
            id="contact-submit-btn"
            type="submit"
            variant={submitStatus === "success" ? "secondary" : "primary"}
            size="sm"
            className={`w-full md:w-1/2 transition-all duration-500 ${submitStatus === "success" ? "!bg-green-500 !text-white !border-green-500 hover:!bg-green-600" : ""}`}
            disabled={isSubmitting}
            rightIcon={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : submitStatus === "success" ? undefined : (
                <ArrowRight className="w-4 h-4" />
              )
            }
          >
            {isSubmitting
              ? t.contact.sending
              : submitStatus === "success"
                ? t.contact.success
                : t.contact.submit}
          </Button>

          {submitStatus === "error" && (
            <p className="text-red-600 font-medium">{t.contact.error}</p>
          )}
        </div>
      </fetcher.Form>

      <div className="mt-20 md:mt-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-10 md:gap-12 md:col-start-1 md:row-start-2 md:self-end">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1 }}
          viewport={{ amount: 0.2, once: true }}
        >
          <h3 className="font-bold mb-6 uppercase text-sm tracking-wider">
            {t.contact.findUs}
          </h3>
          <div className="flex gap-6 text-gray-500 font-bold text-sm tracking-widest">
            <span>FB</span>
            <span>IG</span>
            <span>IN</span>
          </div>
        </motion.div>
        <motion.div
          className="md:text-right"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
          viewport={{ amount: 0.2, once: true }}
        >
          <h3 className="font-bold mb-2 text-lg">{t.contact.address}</h3>
          {t.contact.phone ? (
            <p className="text-gray-500 text-lg">{t.contact.phone}</p>
          ) : null}
        </motion.div>
      </div>
    </article>
  );
};
