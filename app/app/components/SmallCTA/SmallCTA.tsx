import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage, useLayout } from "~/contexts";
import { Button } from "../Elements/Button/Button";

export interface SmallCTAProps {
  /**
   * The main heading text
   * @default Uses layout or translation from translations.smallCTA.heading
   */
  heading?: string;
  /**
   * The subtitle/description text
   * @default Uses layout or translation from translations.smallCTA.subtitle
   */
  subtitle?: string;
  /**
   * The button text
   * @default Uses layout or translation from translations.smallCTA.buttonText
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
  const { t, language } = useLanguage();
  const { layout } = useLayout();
  const lang = language === "pt" ? "pt" : "en";
  const c = layout?.smallCta?.content;

  const displayHeading = heading ?? (c?.[`heading_${lang}` as keyof typeof c] as string) ?? t.smallCTA.heading;
  const displaySubtitle = subtitle ?? (c?.[`subtitle_${lang}` as keyof typeof c] as string) ?? t.smallCTA.subtitle;
  const displayButtonText = buttonText ?? (c?.[`button_text_${lang}` as keyof typeof c] as string) ?? t.smallCTA.buttonText;
  const displayTo = to ?? c?.button_link ?? "/";

  return (
    <motion.article
      className={`flex flex-col items-center justify-center gap-6 px-4 sm:px-8 py-10 sm:py-12 bg-gray-50 max-w-full ${className} md:rounded-2xl mx-auto`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px", amount: 0.2 }}
    >
      {/* Heading */}
      <motion.h2 className="text-3xl md:text-4xl font-bold text-black text-center font-display">
        {displayHeading}
      </motion.h2>

      {/* Subtitle */}
      <motion.p className="text-sm md:text-base text-gray-600 text-center max-w-md leading-relaxed">
        {displaySubtitle}
      </motion.p>

      {/* CTA Button */}
      <motion.div>
        <Button to={displayTo} rightIcon={buttonIcon} className="rounded-full">
          {displayButtonText}
        </Button>
      </motion.div>
    </motion.article>
  );
};
