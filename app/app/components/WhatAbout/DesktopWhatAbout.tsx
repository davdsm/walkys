import { useState, useEffect, useRef } from "react";
import type { CardProps } from "./Card";

export const DesktopWhatAbout = ({ cards }: { cards: CardProps[] }) => {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || cards.length === 0) return;

      const container = containerRef.current as HTMLElement;
      const rect = container.getBoundingClientRect();
      const scrollPosition = -rect.top;
      const sectionHeight = window.innerHeight * 1.2;

      const newSection = Math.min(
        Math.max(0, Math.floor(scrollPosition / sectionHeight)),
        cards.length - 1
      );

      if (newSection !== activeSection) {
        setActiveSection(newSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection, cards.length]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        backgroundColor: "#f1f1f1",
        minHeight: `${cards.length * 150}vh`,
      }}
    >
      {/* Sticky card */}
      <div
        className="sticky mx-auto overflow-hidden rounded-2xl shadow-lg"
        style={{
          top: "12vh",
          width: "min(72vw, 1320px)",
          height: "min(68vh, 820px)",
        }}
      >
        <div className="w-full h-full bg-white flex items-center justify-center p-10 md:p-14">
          <div className="w-full h-full flex flex-col lg:flex-row items-stretch gap-12 lg:gap-16">
            {/* Image */}
            <div className="flex-1 relative min-h-[280px] lg:min-h-0 rounded-xl overflow-hidden bg-[#f1f1f1]">
              {cards.map((section, index) => (
                <div
                  key={index}
                  className="absolute inset-0 transition-opacity duration-700 ease-out"
                  style={{
                    opacity: activeSection === index ? 1 : 0,
                    pointerEvents: activeSection === index ? "auto" : "none",
                  }}
                >
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Text */}
            <div className="flex-1 relative flex flex-col justify-center min-h-0">
              {cards.map((section, index) => (
                <div
                  key={index}
                  className="absolute inset-0 flex flex-col justify-center transition-opacity duration-700 ease-out"
                  style={{
                    opacity: activeSection === index ? 1 : 0,
                    pointerEvents: activeSection === index ? "auto" : "none",
                  }}
                >
                  <p className="text-xs font-medium tracking-[0.25em] uppercase text-black/60 mb-3">
                    Walkys
                  </p>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black tracking-tight mb-5 leading-tight">
                    {section.title}
                  </h3>
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                    {section.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopWhatAbout;
