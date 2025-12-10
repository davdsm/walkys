import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "~/contexts";
import { Input } from "../Elements/Input/Input";
import { Button } from "../Elements/Button/Button";
import { createPocketBase } from "~/lib/pocketbase";
import { createContactService } from "~/lib/services";
import confetti from "canvas-confetti";

export const ContactForm = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    company: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const pb = createPocketBase();
      const contactService = createContactService(pb);

      await contactService.submitContactForm({
        Name: formData.name,
        Subject: formData.subject,
        Company: formData.company,
        Email: formData.email,
        Message: formData.message,
      });

      // Artificial delay before success
      await new Promise((resolve) => setTimeout(resolve, 4000));

      setSubmitStatus("success");
      setFormData({
        name: "",
        subject: "",
        company: "",
        email: "",
        message: "",
      });

      // Trigger confetti
      const button = document.getElementById("contact-submit-btn");
      if (button) {
        const rect = button.getBoundingClientRect();
        const x = (rect.left + rect.right) / 2 / window.innerWidth;
        const y = (rect.top + rect.bottom) / 2 / window.innerHeight;

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x, y },
        });
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl md:max-w-[1200px] mx-auto px-4 font-sans md:grid md:grid-cols-2 md:gap-x-32 md:items-start">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        className="mb-16 md:mb-0 md:col-start-1 md:row-start-1"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 uppercase">
          {t.contact.title}
        </h1>
        <a
          href={`mailto:${t.contact.email}`}
          className="text-gray-500 hover:text-black transition-colors text-lg"
        >
          {t.contact.email}
        </a>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-12 md:col-start-2 md:row-span-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
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
            required
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

        <div className="pt-8 flex flex-col gap-4">
          <Button
            id="contact-submit-btn"
            type="submit"
            variant={submitStatus === "success" ? "secondary" : "primary"}
            className={`transition-all md:w-1/2 duration-500 ${submitStatus === "success" ? "!bg-green-500 !text-white !border-green-500 hover:!bg-green-600" : ""}`}
            disabled={isSubmitting}
            rightIcon={
              isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : submitStatus === "success" ? undefined : (
                <ArrowRight className="w-5 h-5" />
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
      </motion.form>

      <div className="mt-32 md:mt-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:col-start-1 md:row-start-2 md:self-end">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1 }}
          viewport={{ amount: 0.4, once: true }}
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
          viewport={{ amount: 0.4, once: true }}
        >
          <h3 className="font-bold mb-2 text-lg">{t.contact.address}</h3>
          <p className="text-gray-500 text-lg">{t.contact.phone}</p>
        </motion.div>
      </div>
    </div>
  );
};
