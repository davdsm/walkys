import { motion } from "motion/react";
import { Link } from "react-router";

export const OrdersCards = ({
  titulo,
  date,
  icon,
  info
}: {
  titulo: string;
  date: string;
  info: Array<string>;
  icon?: React.ReactNode;
}) => {
  return (
    <motion.article className="pt-[23px] pl-[23px] pb-[23px] pr-[23px] group flex flex-col gap-[12px] text-left w-full md:h-[220px] h-[196px] bg-white text-lg duration-250 ease z-20 rounded-xl">
      <div className="flex justify-between">
        <div className="flex items-center gap-[12px]">
          <div className="h-[22px] w-[22px] flex items-center justify-center">
            {icon ?? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
                className="h-full w-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            )}
          </div>
          <p className="text-black self-center text-lg font-sans">
            {titulo}
          </p>
        </div>
        <p className="text-black self-center text-xs font-sans">
          {date}
        </p>
      </div>
      <div>
        <p className="leading-5 text-xs whitespace-pre-line">{Array.isArray(info) ? info.join("\n") : info}</p>
      </div>
    </motion.article>
  );
};

export default OrdersCards;