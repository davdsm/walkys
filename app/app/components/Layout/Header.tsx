import { motion } from "framer-motion";
import SideMenu from "../Elements/SideMenu/SideMenu";
import { useLanguage } from "~/contexts";

interface HeaderProps {
  variant?: "light" | "dark";
}

export function Header({ variant = "light" }: HeaderProps) {
  const { t } = useLanguage();

  const menuItems = [
    { label: t.header.begin, ariaLabel: "Go to home page", link: "/" },
    { label: t.header.about, ariaLabel: "Learn about us", link: "/about" },
    {
      label: t.header.collection,
      ariaLabel: "View our products",
      link: "/collection",
    },
    { label: t.header.contacts, ariaLabel: "Get in touch", link: "/contact" },
  ];

  const socialItems = [
    { label: "Instagram", link: "https://instagram.com" },
    { label: "Facebook", link: "https://facebook.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

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
          menuButtonColor={variant === "light" ? "#ffffff" : "#000000"}
          openMenuButtonColor={variant === "light" ? "#ffffff" : "#000000"}
          changeMenuColorOnOpen={true}
          colors={["#811568ff", "#d1d5db"]}
          logoUrl="/logo.png"
          accentColor="#000000"
          invertLogo={variant === "light"}
          position="right"
          closeOnClickAway={true}
        />
      </motion.header>
    </>
  );
}
