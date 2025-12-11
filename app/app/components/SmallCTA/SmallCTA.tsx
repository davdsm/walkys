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
      className={`flex flex-col items-center justify-center gap-6 px-8 py-12 bg-gray-50 ${className} md:rounded-2xl md:w-5/6 mx-auto`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px", amount: 0.4 }}
    >
      {/* Heading */}
      <motion.h2 className="text-3xl md:text-4xl font-bold text-black text-center tracking-tight">
        {displayHeading}
      </motion.h2>

      {/* Subtitle */}
      <motion.p className="text-sm md:text-base text-gray-600 text-center max-w-md leading-relaxed">
        {displaySubtitle}
      </motion.p>

      {/* CTA Button */}
      <motion.div>
        <Button to={to} rightIcon={buttonIcon} className="rounded-full">
          {displayButtonText}
        </Button>
      </motion.div>
    </motion.div>
  );
};
