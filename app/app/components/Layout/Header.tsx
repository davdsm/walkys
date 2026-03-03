import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import SideMenu from "../Elements/SideMenu/SideMenu";
import { useLanguage, useLayout } from "~/contexts";
import { useScrollLock } from "~/hooks";

interface HeaderProps {
  variant?: "light" | "dark";
}

const defaultMenuItems = [
  { label_pt: "Início", label_en: "Begin", link: "/" },
  { label_pt: "A Walkys", label_en: "Walkys", link: "/about" },
  { label_pt: "Outono / Inverno", label_en: "Autumn / Winter", link: "/collection/autmn-winter-25" },
  { label_pt: "Contactos", label_en: "Contacts", link: "/contact" },
];

const defaultSocialItems = [
  { label: "Instagram", link: "https://instagram.com" },
  { label: "Facebook", link: "https://facebook.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

export function Header({ variant = "light" }: HeaderProps) {
  const { t, language } = useLanguage();
  const { layout } = useLayout();
  const { lock, unlock } = useScrollLock();

  // Ensure logo + menu are light/inverted whenever the body background is black
  let effectiveVariant: "light" | "dark" = variant;
  if (typeof document !== "undefined") {
    const bodyBg = document.body.style.backgroundColor;
    if (bodyBg === "black") {
      effectiveVariant = "light";
    }
  }

  useEffect(() => {
    return () => unlock();
  }, [unlock]);

  const menuItems = useMemo(() => {
    const items = layout?.header?.content?.menuItems?.length ? layout.header.content.menuItems : defaultMenuItems;
    return items.map((item) => ({
      label: language === "pt" ? item.label_pt : item.label_en,
      ariaLabel: item.link === "/" ? t.header.ariaHome : item.link === "/about" ? t.header.ariaAbout : item.link === "/contact" ? t.header.ariaContacts : t.header.ariaCollection,
      link: item.link,
    }));
  }, [layout?.header?.content?.menuItems, language, t]);

  const socialItems = useMemo(() => {
    return layout?.header?.content?.socialItems?.length ? layout.header.content.socialItems : defaultSocialItems;
  }, [layout?.header?.content?.socialItems]);

  const logoUrl = layout?.header?.logoUrl ?? "/logo.png";

  return (
    <>
      <motion.header
        id="main-header"
        className="w-full fixed top-0 left-0 z-50 flex items-center justify-between bg-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0, ease: "easeInOut" }}
      >
        <SideMenu
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          menuButtonColor={effectiveVariant === "light" ? "#ffffff" : "#000000"}
          openMenuButtonColor={effectiveVariant === "light" ? "#ffffff" : "#000000"}
          changeMenuColorOnOpen={true}
          colors={["#811568ff", "#d1d5db"]}
          logoUrl={logoUrl}
          accentColor="#000000"
          invertLogo={effectiveVariant === "light"}
          position="right"
          closeOnClickAway={true}
          onMenuOpen={lock}
          onMenuClose={unlock}
        />
      </motion.header>
    </>
  );
}
