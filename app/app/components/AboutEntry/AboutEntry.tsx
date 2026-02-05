import { motion } from "framer-motion";
import { ParallaxBanner } from "react-scroll-parallax";

export const AboutEntry = ({
  img,
  title,
  text,
  eyebrow,
}: {
  img: string;
  title: string;
  text: string;
  eyebrow?: string;
}) => {
  return (
    <motion.article className="relative w-full flex flex-col bg-[#f1f1f1] min-h-[75vh] md:min-h-[85vh] overflow-hidden">
      <div className="absolute inset-0">
        <ParallaxBanner
          layers={[{ image: img, speed: -12 }]}
          className="w-full h-full absolute inset-0"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent rounded-br-[120px] md:rounded-br-[280px]"
          aria-hidden
        />
      </div>
      <div className="relative z-10 flex flex-col justify-end min-h-[75vh] md:min-h-[85vh] pb-16 md:pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-2xl">
          {eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="text-white/90 text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-4"
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.95] tracking-tight"
          >
            {title}
          </motion.h1>
          {text && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
              className="mt-6 text-white/95 text-base md:text-lg lg:text-xl max-w-xl leading-relaxed"
            >
              {text}
            </motion.p>
          )}
        </div>
      </div>
    </motion.article>
  );
};
