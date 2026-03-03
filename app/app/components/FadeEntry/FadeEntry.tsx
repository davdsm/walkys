import { ParallaxBanner } from "react-scroll-parallax";
import { motion } from "motion/react";

export const FadeEntry = ({
  image,
  title,
}: {
  image: string;
  title: string;
}) => {
  return (
    <article>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        className="relative"
      >
        <ParallaxBanner
          layers={[{ image, speed: -20 }]}
          className="w-full h-[80svh] object-cover z-01"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
          className="absolute top-0 left-0 w-full h-full bg-black/50 z-02"
        ></motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 1.5 }}
          className="text-3xl md:text-8xl absolute top-0 left-0 w-full flex items-center pt-24 h-full justify-center font-bold text-white z03 text-center font-display"
        >
          {title}
        </motion.h2>
      </motion.div>
    </article>
  );
};
