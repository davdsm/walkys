import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "~/components/Elements/Button/Button";
import { Link } from "react-router";

export const HomeHero = ({
  title,
  subtitle,
  product,
  categories,
}: {
  title: string;
  subtitle: string;
  product: {
    image: string;
    name: string;
    link: string;
  };
  categories: {
    name: string;
    link: string;
  }[];
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts and browser has painted
    // Using requestAnimationFrame ensures animations run on refresh
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <article className="w-full py-30 md:py-12 flex flex-col justify-center items-center px-6 lg:px-20 relative">
      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-12">
        {/* Text Content - Desktop: Left, Mobile: Top */}
        <div className="flex flex-col items-start w-full lg:w-1/2 order-1">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isMounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-2xl md:text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-black leading-none lg:uppercase"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-3 md:mt-8 text-md md:text-xl lg:text-4xl text-black font-thin opacity-90 leading-tight"
          >
            {subtitle}
          </motion.p>

          {/* Desktop Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="hidden lg:flex flex-wrap gap-4 mt-12"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.4 + index * 0.2,
                  ease: "easeOut",
                }}
              >
                <Button
                  to={category.link}
                  variant="outline"
                  className="rounded-xl border-black text-black hover:bg-[#f1f1f1] hover:text-black transition-all duration-500 uppercase px-10 py-4 text-xs font-bold tracking-widest min-w-[160px]"
                >
                  {category.name}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Hero Image - Desktop: Right, Mobile: Middle */}
        <motion.div
          initial={{ opacity: 0, x: 90 }}
          animate={isMounted ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 1 }}
          className="w-full lg:w-[45%] order-2 lg:order-2"
        >
          <div className="relative aspect-[4/5] lg:aspect-[3/3.8] rounded-[20px] md:rounded-[40px] overflow-hidden group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />

            {/* Interactive Tag */}
            <Link to={product.link}>
              <motion.div
                initial={{ x: 20 }}
                animate={isMounted ? { x: 0 } : {}}
                transition={{ duration: 1.2, delay: 1.3 }}
                className="absolute bottom-8 right-8 md:bottom-12 md:right-12 bg-white/95 backdrop-blur px-5 py-2.5 rounded-full flex items-center gap-3 cursor-pointer hover:bg-black hover:text-white transition-all duration-300 group/tag"
              >
                <div className="w-5 h-5 flex items-center justify-center rounded-full border border-black group-hover/tag:border-white transition-colors">
                  <Plus className="w-3 h-3" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em]">
                  {product.name}
                </span>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Mobile Buttons - Below Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isMounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex sm:flex-row w-full lg:hidden gap-4 order-3 mt-4 overflow-x-auto scrollbar-hide"
        >
          {categories.map((category) => (
            <Button
              key={category.name}
              variant="outline"
              to={category.link}
              className="w-full rounded-xl border-black text-black hover:bg-black hover:text-white transition-all duration-300 uppercase py-6 text-sm font-bold tracking-widest"
            >
              {category.name}
            </Button>
          ))}
        </motion.div>
      </div>
    </article>
  );
};
