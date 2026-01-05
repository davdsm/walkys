import { motion } from "framer-motion";
import type { MouseEventHandler } from "react";

export const Filters = ({
  items,
  activeFilter,
  className,
  itemClassName,
  delay = 0,
}: {
  items: {
    id: string;
    text: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
  }[];
  activeFilter: string;
  className?: string;
  itemClassName?: string;
  delay?: number;
}) => {
  return (
    <ul className={`flex row gap-8 justify-center items-center ${className}`}>
      {items &&
        items.map((item, index: number) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: delay + index / 8,
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              onClick={item.onClick}
              className={`relative transition-all transition-ease duration-200 cursor-pointer font-regular uppercase ${item.id === activeFilter ? "font-bold" : ""} ${itemClassName}`}
            >
              {item.text}
              <motion.hr
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: item.id === activeFilter ? "50%" : 0,
                  opacity: item.id === activeFilter ? 1 : 0,
                }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="border-1 float-right absolute -bottom-[2px] right-0"
              />
            </button>
          </motion.li>
        ))}
    </ul>
  );
};

export default Filters;
