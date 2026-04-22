import { Link } from "react-router";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { useMemo } from "react";

import { useLanguage, useLayout } from "../../contexts";
import { LanguageSwitcher } from "../Elements/LanguageSwitcher/LanguageSwitcher";

export const Footer = ({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) => {
  const { t, language } = useLanguage();
  const { layout } = useLayout();
  const c = layout?.footer?.content;
  const lang = language === "pt" ? "pt" : "en";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const logoText = c?.logoText ?? "WALKYS";
  const menuItems = useMemo(() => {
    const items = c?.menuItems?.length ? c.menuItems : [
      { label_pt: "Início", label_en: "Begin", link: "/" },
      { label_pt: "A Walkys", label_en: "Walkys", link: "/about" },
      { label_pt: "Outono / Inverno", label_en: "Autumn / Winter", link: "/collection/autmn-winter-25" },
      { label_pt: "Contactos", label_en: "Contacts", link: "/contact" },
      { label_pt: "Termos & Condições", label_en: "Terms & Conditions", link: "/terms" },
      { label_pt: "Privacidade", label_en: "Privacy", link: "/privacy" },
    ];
    return items.filter((item) => item.link !== "/contact");
  }, [c?.menuItems]);

  const address = c?.[`address_${lang}` as keyof typeof c] ?? c?.address_pt ?? t.footer.addressValue;
  const email = c?.email ?? "walkys@walkys.com";

  const scheduleLabel = t.footer.schedule;
  const scheduleHours = c?.[`schedule_${lang}` as keyof typeof c] ?? c?.schedule_pt ?? t.footer.scheduleHours;
  const explore = c?.[`explore_${lang}` as keyof typeof c] ?? c?.explore_pt ?? t.footer.explore;
  const newCollection = c?.[`new_collection_${lang}` as keyof typeof c] ?? c?.new_collection_pt ?? t.footer.newCollection;
  const copyright = c?.[`copyright_${lang}` as keyof typeof c] ?? c?.copyright_pt ?? t.footer.copyright;
  const ctaLink = c?.cta_link ?? "/collections/new";
  const footerImageUrl = layout?.footer?.imageCtaUrl ?? "/images/footer.jpg";

  return (
    <footer
      id="main-footer"
      className={`md:p-16 ${variant === "light" ? "bg-[#f1f1f1]" : "bg-black "}`}
    >
      <div className="md:rounded-3xl bg-[#191C19] text-white px-6 py-16 md:px-20 md:py-16 font-sans relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col">
            <div className="gap-10 md:gap-20 flex justify-between items-start mb-16 md:mb-32 flex-col md:flex-row">
              <div className="w-full md:w-1/2 min-w-0">
                <Link to="/" className="inline-flex items-start gap-2 group">
                  <h1 className="text-5xl font-display">{logoText}</h1>
                  <ArrowUpRight
                    className="w-7 h-7 mt-3 opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    strokeWidth={1.5}
                  />
                </Link>

                <nav className="text-[#ADB3AB] flex flex-flow gap-2 text-md font-thin min-w-[240px] flex-wrap mt-6">
                  {menuItems.map((item, i) => (
                    <span key={i}>
                      <Link
                        to={item.link}
                        className="text-xl hover:text-white transition-colors"
                      >
                        {lang === "pt" ? item.label_pt : item.label_en}
                      </Link>
                      {i < menuItems.length - 1 ? " / " : null}
                    </span>
                  ))}
                </nav>
                <img
                  className="w-full h-12 my-12 object-contain object-left invert"
                  src={layout?.footer?.imageUrl ?? "/images/2020.png"}
                  alt=""
                />
              </div>

              <div className="w-full md:w-1/3 flex flex-col md:flex-row gap-10 md:gap-16 lg:gap-32 min-w-0">
                <div className="flex flex-col gap-8 md:gap-12 w-full min-w-0 md:max-w-none">
                  <div className="flex flex-col md:grid grid-cols-2 gap-12">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-white/50 mb-5">
                        {t.footer.address}
                      </h4>
                      <p className="text-sm font-light leading-relaxed text-white/80">
                        {address}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-white/50 mb-5">
                        {t.footer.email}
                      </h4>
                      <a
                        href={`mailto:${email}`}
                        className="text-sm font-light text-white/80 hover:text-white transition-colors"
                      >
                        {email}
                      </a>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-white/50 mb-5">
                      {scheduleLabel}
                    </h4>
                    <p className="text-2xl font-light ">{scheduleHours}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-8 flex-col w-full">
              <div className="flex items-center justify-between gap-8">
                <button
                  onClick={scrollToTop}
                  className="flex items-center justify-center w-12 h-12 rounded-full border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-300 flex-shrink-0"
                  aria-label={t.footer.backToTop}
                >
                  <ArrowUp className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <LanguageSwitcher variant="light" className="" />
              </div>

              <Link to={ctaLink} className="flex-grow group w-full">
                <div
                  className="relative before:content-[''] before:absolute before:inset-0 before:bg-black before:opacity-50 bg-cover bg-center hover:bg-[left_center] rounded-xl px-6 py-8 sm:px-10 sm:py-10 md:px-16 md:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden backdrop-blur-sm min-h-0"
                  style={{ backgroundImage: `url(${footerImageUrl})` }}
                >
                  <div className="relative z-10 min-w-0 pr-2">
                    <span className="block text-white/70 text-sm sm:text-[16px] font-light mb-2">
                      {explore}
                    </span>
                    <span className="block text-xl sm:text-2xl md:text-[32px] text-white leading-tight">
                      {newCollection}
                    </span>
                  </div>
                  <ArrowUpRight
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white shrink-0 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform"
                    strokeWidth={1.5}
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </div>

            <div className="mt-4 text-[11px] font-bold text-white/10 tracking-wide text-left">
              {copyright}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
