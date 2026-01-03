import { useState, useEffect, useRef } from "react";
import type { CardProps } from "./Card";

export const DesktopWhatAbout = ({ cards }: { cards: CardProps[] }) => {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

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
  }, [activeSection]);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: "#f1f1f1",
        minHeight: `${cards.length * 150}vh`,
        position: "relative",
      }}
    >
      {/* Sticky White Box */}
      <div
        className="sticky bg-white rounded-xl mx-auto overflow-hidden"
        style={{
          top: "15vh",
          width: "70vw",
          height: "70vh",
          maxWidth: "1400px",
          maxHeight: "900px",
        }}
      >
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="w-full h-full flex items-center gap-16">
            {/* Image Section */}
            <div className="flex-1 relative h-full">
              {cards.map((section, index) => (
                <div
                  key={index}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{
                    opacity: activeSection === index ? 1 : 0,
                    pointerEvents: activeSection === index ? "auto" : "none",
                  }}
                >
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>

            {/* Text Section */}
            <div className="flex-1 relative h-full">
              {cards.map((section, index) => (
                <div
                  key={index}
                  className="absolute inset-0 flex flex-col justify-center transition-opacity duration-700"
                  style={{
                    opacity: activeSection === index ? 1 : 0,
                    pointerEvents: activeSection === index ? "auto" : "none",
                  }}
                >
                  <p className="text-sm tracking-wider mb-4 text-gray-600">
                    Walkys
                  </p>
                  <h2 className="text-5xl font-bold mb-6">
                    {section.title}
                  </h2>
                  <p className="text-gray-700 text-lg">
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
