import { useRef, type FC } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export interface ScrollPinState {
  image: string;
  title: string;
  description: string;
}

export interface ScrollPinAboutSectionProps {
  title?: string;
  states: ScrollPinState[];
}

const MAX_STATES = 4;
/** Width of fade band as fraction of one state (0–1). Larger = longer crossfade. */
const FADE_BAND = 0.15;

/**
 * Scroll-pin section: tall container + sticky 100vh viewport.
 * Scroll progress 0→1 as container scrolls through viewport; opacity/scale driven by progress.
 */
function useScrollPinAnimation(numStates: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const n = Math.max(1, Math.min(MAX_STATES, numStates));
  const containerHeightVh = n * 100;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Easing for opacity/scale (smoother than linear)
  const easeOut = (t: number) => 1 - (1 - t) ** 2;

  const opacity0 = useTransform(scrollYProgress, (v) => {
    if (n === 1) return 1;
    const band = Math.min(FADE_BAND, 0.5 / n);
    if (v <= 0) return 0;
    if (v < band) return easeOut(v / band);
    if (v < 1 / n - band) return 1;
    if (v < 1 / n) return 1 - easeOut((v - (1 / n - band)) / band);
    return 0;
  });

  const opacity1 = useTransform(scrollYProgress, (v) => {
    if (n < 2) return 0;
    const band = Math.min(FADE_BAND, 0.5 / n);
    const start = 1 / n - band;
    const end = Math.min(1, 2 / n + band);
    if (v <= start) return 0;
    if (v < 1 / n) return easeOut((v - start) / band);
    if (v < 2 / n - band) return 1;
    if (v < end) return 1 - easeOut((v - (2 / n - band)) / band);
    return 0;
  });

  const opacity2 = useTransform(scrollYProgress, (v) => {
    if (n < 3) return 0;
    const band = Math.min(FADE_BAND, 0.5 / n);
    const start = 2 / n - band;
    const end = Math.min(1, 3 / n + band);
    if (v <= start) return 0;
    if (v < 2 / n) return easeOut((v - start) / band);
    if (v < 3 / n - band) return 1;
    if (v < end) return 1 - easeOut((v - (3 / n - band)) / band);
    return 0;
  });

  const opacity3 = useTransform(scrollYProgress, (v) => {
    if (n < 4) return 0;
    const band = Math.min(FADE_BAND, 0.5 / n);
    const start = 3 / n - band;
    if (v <= start) return 0;
    if (v < 3 / n) return easeOut((v - start) / band);
    if (v < 1 - band) return 1;
    if (v <= 1) return 1 - easeOut((v - (1 - band)) / band);
    return 0;
  });

  const stateOpacities = [opacity0, opacity1, opacity2, opacity3];

  // Subtle scale: active state scales from 0.97 to 1
  const scale0 = useTransform(scrollYProgress, (v) => {
    if (n === 1) return 1;
    const mid = 0.5 / n;
    if (v >= 0 && v <= 1 / n) return 0.97 + 0.03 * Math.min(1, v / mid);
    return 0.97;
  });
  const scale1 = useTransform(scrollYProgress, (v) => {
    if (n < 2) return 0.97;
    const mid = 1 / n + 0.5 / n;
    if (v >= 1 / n && v <= 2 / n) return 0.97 + 0.03 * Math.min(1, (v - 1 / n) / (0.5 / n));
    return 0.97;
  });
  const scale2 = useTransform(scrollYProgress, (v) => {
    if (n < 3) return 0.97;
    if (v >= 2 / n && v <= 3 / n) return 0.97 + 0.03 * Math.min(1, (v - 2 / n) / (0.5 / n));
    return 0.97;
  });
  const scale3 = useTransform(scrollYProgress, (v) => {
    if (n < 4) return 0.97;
    if (v >= 3 / n && v <= 1) return 0.97 + 0.03 * Math.min(1, (v - 3 / n) / (0.5 / n));
    return 0.97;
  });
  const stateScales = [scale0, scale1, scale2, scale3];

  return { containerRef, containerHeightVh, stateOpacities, stateScales, n };
}

/**
 * What About section with scroll-pin:
 * - Tall container (n × 100vh) so the section "holds" scroll for n steps
 * - Sticky 100vh viewport: while you scroll through the container, this stays fixed
 * - Opacity + scale animation per state so content fades and scales as you scroll
 */
export const ScrollPinAboutSection: FC<ScrollPinAboutSectionProps> = ({
  title = "What About",
  states,
}) => {
  const numStates = Math.min(MAX_STATES, Math.max(1, states?.length ?? 0));
  const { containerRef, containerHeightVh, stateOpacities, stateScales, n } =
    useScrollPinAnimation(numStates);

  if (!states || states.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#f8f8f8]"
      style={{ height: `${containerHeightVh}vh` }}
    >
      {/* Pinned viewport: stays fixed while container scrolls through */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#f8f8f8]">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 h-full flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
          {/* Image column */}
          <div className="w-full md:w-1/2 flex-shrink-0 relative aspect-[4/3] md:aspect-[6/5] md:min-h-[60vh] rounded-xl overflow-hidden bg-white shadow-lg">
            {states.slice(0, n).map((state, i) => {
              const opacity = stateOpacities[i];
              const scale = stateScales[i];
              if (!opacity) return null;
              return (
                <motion.div
                  key={`img-${i}`}
                  style={{ opacity, scale }}
                  className="absolute inset-0 w-full h-full origin-center [will-change:opacity,transform]"
                >
                  <img
                    src={state.image}
                    alt={state.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Text column */}
          <div className="w-full md:w-1/2 flex flex-col justify-center relative min-h-[180px] md:min-h-0">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight">
              {title}
            </h2>
            <div className="relative min-h-[140px] md:min-h-[200px]">
              {states.slice(0, n).map((state, i) => {
                const opacity = stateOpacities[i];
                const scale = stateScales[i];
                if (!opacity) return null;
                return (
                  <motion.div
                    key={`text-${i}`}
                    style={{ opacity, scale }}
                    className="absolute inset-0 top-0 left-0 right-0 origin-top-left [will-change:opacity,transform]"
                  >
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                      {state.title}
                    </h3>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                      {state.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Hint: scroll through the section */}
            <p className="text-sm text-gray-500 mt-6 md:mt-8">
              {n > 1 ? "Scroll to explore" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollPinAboutSection;
