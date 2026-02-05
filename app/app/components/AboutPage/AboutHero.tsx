import { motion } from "framer-motion";

export interface AboutHeroProps {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function AboutHero({ image, eyebrow, title, subtitle }: AboutHeroProps) {
  return (
    <header className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover opacity-70"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"
          aria-hidden
        />
      </div>

      {/* Content — centered */}
      <div className="relative z-10 px-6 md:px-12 text-center max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="text-white/80 text-xs md:text-sm font-medium tracking-[0.35em] uppercase mb-6"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.92] tracking-tight"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}
            className="mt-8 text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </header>
  );
}
