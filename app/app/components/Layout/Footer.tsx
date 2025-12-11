import { Link } from "react-router";
import { ArrowUpRight, ArrowUp } from "lucide-react";

import { useLanguage } from "../../contexts";
import { LanguageSwitcher } from "../Elements/LanguageSwitcher/LanguageSwitcher";

export const Footer = ({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) => {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="main-footer"
      className={`md:p-16 ${variant === "light" ? "bg-[#f1f1f1]" : "bg-black "}`}
    >
      <div className="md:rounded-3xl bg-[#191C19] text-white px-6 py-16 md:px-20 md:py-16 font-sans relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          {/* Desktop Layout */}
          <div className="flex flex-col">
            {/* Top Section */}
            <div className="flex justify-between items-start mb-32 flex-col md:flex-row">
              {/* Logo */}
              <div className="w-1/2">
                <Link to="/" className="inline-flex items-start gap-2 group">
                  <h1 className="text-5xl ">WALKYS</h1>
                  <ArrowUpRight
                    className="w-7 h-7 mt-3 opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    strokeWidth={1.5}
                  />
                </Link>

                {/* Navigation */}
                <nav className="text-[#ADB3AB] flex flex-flow gap-2 text-md font-thin min-w-[240px] flex-wrap mt-6">
                  <Link
                    to="/"
                    className="text-xl hover:text-white transition-colors"
                  >
                    {t.footer.begin} /
                  </Link>
                  <Link
                    to="/about"
                    className="text-xl hover:text-white transition-colors"
                  >
                    {t.footer.about} /
                  </Link>
                  <Link
                    to="/collections/fw"
                    className="text-xl hover:text-white transition-colors"
                  >
                    {t.footer.collection} /
                  </Link>
                  <Link
                    to="/contact"
                    className="text-xl hover:text-white transition-colors"
                  >
                    {t.footer.contacts} /
                  </Link>
                  <Link
                    to="/terms"
                    className="text-xl hover:text-white transition-colors"
                  >
                    {t.footer.terms} /
                  </Link>
                  <Link
                    to="/privacy"
                    className="text-xl hover:text-white transition-colors"
                  >
                    {t.footer.privacy}
                  </Link>
                </nav>
                <img
                  className="w-full h-12 my-12 object-contain object-left"
                  src="images/2020.png"
                  alt="Portugal 2020"
                />
              </div>

              {/* Navigation & Contact Grid */}
              <div className="flex gap-32">
                {/* Contact Info */}
                <div className="flex flex-col gap-12 min-w-[400px]">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-white/50 mb-5">
                      {t.footer.contact}
                    </h4>
                    <a
                      href="tel:+351253412421"
                      className="text-2xl font-light tracking-tight hover:text-white/70 transition-colors block"
                    >
                      ( +351 253 412 421 )
                    </a>
                  </div>

                  <div className="flex flex-col md:grid grid-cols-2 gap-12">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-white/50 mb-5">
                        {t.footer.address}
                      </h4>
                      <p className="text-sm font-light leading-relaxed text-white/80">
                        2972 Westheimer Rd. Santa Ana,
                        <br />
                        Illinois 85486
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-white/50 mb-5">
                        {t.footer.email}
                      </h4>
                      <a
                        href="mailto:hello@walkys.pt"
                        className="text-sm font-light text-white/80 hover:text-white transition-colors"
                      >
                        hello@walkys.pt
                      </a>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-white/50 mb-5">
                      {t.footer.schedule}
                    </h4>
                    <p className="text-2xl font-light ">9h—18h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-start justify-between gap-8 flex-col w-full">
              <div className="flex items-center justify-between gap-8">
                {/* Back to Top Button */}
                <button
                  onClick={scrollToTop}
                  className="flex items-center justify-center w-12 h-12 rounded-full border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-300 flex-shrink-0"
                  aria-label="Back to top"
                >
                  <ArrowUp className="w-5 h-5" strokeWidth={1.5} />
                </button>

                <LanguageSwitcher variant="light" className="" />
              </div>

              {/* CTA Card */}
              <Link to="/collections/new" className="flex-grow group w-full">
                <div className="relative before:content-[''] before:absolute before:inset-0 before:bg-black before:opacity-50 bg-[url('/images/footer.jpg')] bg-cover bg-center hover:bg-[left_center] rounded-xl px-16 py-12 flex items-center justify-between relative overflow-hidden backdrop-blur-sm">
                  <div className="relative z-10">
                    <span className="block text-white/70 text-[16px] font-light mb-2">
                      {t.footer.explore}
                    </span>
                    <span className="block text-[32px] text-white ">
                      {t.footer.newCollection}
                    </span>
                  </div>
                  <ArrowUpRight
                    className="w-12 h-12 text-white group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform"
                    strokeWidth={1.5}
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </div>

            {/* Copyright */}
            <div className="mt-4 text-[11px] font-bold text-white/10 tracking-wide text-left">
              {t.footer.copyright}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
