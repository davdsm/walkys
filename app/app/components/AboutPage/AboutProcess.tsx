import { motion } from "framer-motion";

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  image: string;
}

export interface AboutProcessProps {
  sectionTitle: string;
  steps: ProcessStep[];
}

export function AboutProcess({ sectionTitle, steps }: AboutProcessProps) {
  if (!steps.length) return null;

  return (
    <section className="w-full py-20 md:py-28 lg:py-36" aria-labelledby="about-process-heading">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.h2
          id="about-process-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.2, once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-black tracking-tight uppercase mb-14 md:mb-20"
        >
          {sectionTitle}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.2, once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
              className="group flex flex-col"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#f1f1f1] mb-5">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-black tracking-tight mb-2">
                {step.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
