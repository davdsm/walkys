import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "~/contexts";
import { Button } from "../Elements/Button/Button";

export interface SmallCTAProps {
  /**
   * The main heading text
   * @default Uses translation from translations.smallCTA.heading
   */
  heading?: string;
  /**
   * The subtitle/description text
   * @default Uses translation from translations.smallCTA.subtitle
   */
  subtitle?: string;
  /**
   * The button text
   * @default Uses translation from translations.smallCTA.buttonText
   */
  buttonText?: string;
  /**
   * The destination URL for the button
   */
  to?: string;
  /**
   * Additional CSS class for the container
   */
  className?: string;
  /**
   * Icon to display in button (defaults to ArrowRight)
   */
  buttonIcon?: ReactNode;
}

export const SmallCTA = ({
  heading,
  subtitle,
  buttonText,
  to,
  className = "",
  buttonIcon = <ArrowRight className="w-5 h-5" />,
}: SmallCTAProps) => {
  const { t } = useLanguage();

  const displayHeading = heading || t.smallCTA.heading;
  const displaySubtitle = subtitle || t.smallCTA.subtitle;
  const displayButtonText = buttonText || t.smallCTA.buttonText;

  return (
    <motion.div
      className={`flex flex-col items-center justify-center gap-6 px-8 py-12 bg-gray-50 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Heading */}
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-black text-center tracking-tight"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {displayHeading}
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        className="text-sm md:text-base text-gray-600 text-center max-w-md leading-relaxed"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {displaySubtitle}
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true, margin: "-100px" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          to={to}
          rightIcon={buttonIcon}
          className="rounded-full"
        >
          {displayButtonText}
        </Button>
      </motion.div>
    </motion.div>
  );
};
