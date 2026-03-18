import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface AboutVideoSectionProps {
  src: string;
  poster?: string;
}

export function AboutVideoSection({ src, poster }: AboutVideoSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Animate so the video only reaches full-screen when ~half of it is visible
  // (around scrollYProgress 0.5), then stays fullscreen for the rest.
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.5, 1], ["1.5rem", "0rem", "0rem"]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen bg-[#f1f1f1]"
      aria-label="Brand video"
    >
      <div className="w-full h-full flex items-center justify-center">
        <motion.div
          style={{ scale, borderRadius }}
          className="w-full h-full overflow-hidden bg-black"
        >
          <video
            src={src}
            poster={poster}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutVideoSection;

