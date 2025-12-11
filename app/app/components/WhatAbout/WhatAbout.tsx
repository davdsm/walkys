import type { FC } from "react";
import { motion } from "framer-motion";
import { Card, type CardProps } from "./Card";
import { useParallax } from "react-scroll-parallax";

export interface WhatAboutProps {
  title?: string;
  cards: CardProps[];
}

export const WhatAbout: FC<WhatAboutProps> = ({
  title = "What About",
  cards,
}) => {
  const { ref } = useParallax({ speed: 5 });

  return (
    <div className="w-full" ref={ref}>
      <div className="">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
            delay: 2,
          }}
          className="mb-12 md:mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            {title}
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="flex gap-4 w-full md:w-3/4">
          {cards.map((card, index) => (
            <Card
              key={`card-${index}`}
              index={index}
              image={card.image}
              title={card.title}
              description={card.description}
              alt={card.alt}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatAbout;
