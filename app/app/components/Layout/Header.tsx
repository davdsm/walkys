import { Link } from "react-router";
import { LanguageSwitcher } from "~/components/Elements/LanguageSwitcher/LanguageSwitcher";
import { motion } from "framer-motion";
import SideMenu from "../Elements/SideMenu/SideMenu";

interface HeaderProps {
  variant?: "light" | "dark";
}

export function Header({ variant = "light" }: HeaderProps) {
  const menuItems = [
    { label: "Begin", ariaLabel: "Go to home page", link: "/" },
    { label: "About", ariaLabel: "Learn about us", link: "/about" },
    {
      label: "Collection",
      ariaLabel: "View our products",
      link: "/collection",
    },
    { label: "Contacts", ariaLabel: "Get in touch", link: "/contact" },
  ];

  const socialItems = [
    { label: "Instagram", link: "https://instagram.com" },
    { label: "Facebook", link: "https://facebook.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  return (
    <>
      <motion.header
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
          menuButtonColor="#ffffff"
          openMenuButtonColor="#111827"
          changeMenuColorOnOpen={true}
          colors={["#e5e7eb", "#d1d5db"]}
          logoUrl="/logo.png"
          accentColor="#000000"
          isFixed={false}
          position="right"
          closeOnClickAway={true}
        />
        {/* <div className="absolute top-30 left-5 z-20">
          <LanguageSwitcher variant={variant} />
        </div> */}
      </motion.header>
    </>
  );
}
