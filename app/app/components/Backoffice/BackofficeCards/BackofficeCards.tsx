import { motion } from "motion/react";
import { Link } from "react-router";

export const BackofficeCards = ({
  titulo,
  info,
  link,
  icon,
}: {
  titulo: string;
  info: string;
  link: string;
  icon?: React.ReactNode;
}) => {
  return (
    <Link to={link} className="no-underline">
      <motion.article className="pt-[22px] pl-[22px] pb-[20px] pr-[22px] group flex flex-col justify-between text-left w-full md:h-[220px] h-[185px] bg-white text-lg hover:bg-black duration-250 ease z-20 rounded-xl">
        <div className="flex items-center gap-[12px]">
          <div className="md:h-[25px] md:w-[25px] h-[22px] w-[22px] flex items-center justify-center">
            {icon ?? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="group-hover:text-white w-full h-full "
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            )}
          </div>
          <p className="md:text-xl text-black self-center group-hover:text-white text-lg font-sans">
            {titulo}
          </p>
        </div>

        <p className="text-black group-hover:text-white font-bold text-[25px] font-sans">
          {info}
        </p>
      </motion.article>
    </Link>
  );
};

export default BackofficeCards;