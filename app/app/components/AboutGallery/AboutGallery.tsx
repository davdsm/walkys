import { motion } from "framer-motion";
import MasonryGallery from "../Elements/MansoryGallery/MansoryGallery";

export const AboutGallery = ({
  items,
}: {
  items: { id: string; img: string; height: number }[];
}) => {
  return (
    <article className="relative w-full py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.3, once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className=""
      >
        <div className="w-full min-h-screen">
          <MasonryGallery
            items={items}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover={true}
            hoverScale={0.95}
            blurToFocus={true}
            colorShiftOnHover={false}
          />
        </div>
      </motion.div>
    </article>
  );
};

export default AboutGallery;
