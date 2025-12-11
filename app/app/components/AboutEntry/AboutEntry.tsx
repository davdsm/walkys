import { motion } from "framer-motion";
import { ParallaxBanner } from "react-scroll-parallax";

export const AboutEntry = ({
  img,
  title,
  text,
}: {
  img: string;
  title: string;
  text: string;
}) => {
  return (
    <motion.article className="relative w-full flex flex-col bg-[#f1f1f1] h-[85vh]">
      <div className="h-[80vh] relative flex flex-col justify-end items-end">
        <ParallaxBanner
          layers={[{ image: img, speed: -9 }]}
          className="w-full h-full object-cover z-01 rounded-br-[150px] md:rounded-br-[350px] w-full h-full absolute top-0 left-0"
        />
        <div
          className={`z-02 transition duration-700 transition-all ease absolute top-0 h-full bg-black/70 w-full left-0 rounded-br-[150px] md:rounded-br-[350px]`}
        ></div>
        <div className="z-03 absolute text-white py-20 px-8 bottom-0 left-0 mx-auto md:w-1/2 md:left-30">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1 }}
            className="text-5xl font-bold md:text-8xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
            className="w-3/4 pt-4 text-sm md:text-xl"
          >
            {text}
          </motion.p>
        </div>
      </div>
    </motion.article>
  );
};
