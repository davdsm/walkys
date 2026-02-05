import { motion } from "framer-motion";

export interface ValueBlock {
  image: string;
  title: string;
  description: string;
}

export interface AboutValuesProps {
  sectionTitle: string;
  values: ValueBlock[];
}

export function AboutValues({ sectionTitle, values }: AboutValuesProps) {
  if (!values.length) return null;

  return (
    <section className="w-full bg-[#f1f1f1]" aria-labelledby="about-values-heading">
      <motion.h2
        id="about-values-heading"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.2, once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center w-full text-3xl md:text-4xl lg:text-5xl font-bold text-black tracking-tight px-6 md:px-12 lg:px-20 py-16 md:py-20 pb-10"
      >
        {sectionTitle}
      </motion.h2>

      <div className="space-y-0">
        {values.map((value, index) => (
          <motion.article
            key={index}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.15, once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
            className={`w-full flex flex-col md:flex-row`}
          >
            <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[50vh] relative overflow-hidden">
              <img
                src={value.image}
                alt={value.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div
              className={`w-full md:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12 md:py-20 md:pl-16 lg:pl-24`}
            >
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black tracking-tight mb-4">
                {value.title}
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                {value.description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
