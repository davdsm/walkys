import { motion } from "framer-motion";

export interface AboutStoryProps {
  title: string;
  body: string;
}

export function AboutStory({ title, body }: AboutStoryProps) {
  if (!title && !body) return null;

  return (
    <section className="w-full py-20 md:py-28 lg:py-36 bg-white" aria-labelledby="about-story-heading">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.2, once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto px-6 md:px-10"
      >
        {title && (
          <h2 id="about-story-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-black tracking-tight mb-10">
            {title}
          </h2>
        )}
        {body && (
          <div className="text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed font-light">
            {body.split("\n").map((para, i) => (
              <p key={i} className={i > 0 ? "mt-6" : ""}>
                {para}
              </p>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
