import { motion } from "motion/react"
import { Link } from "react-router";
import {ArchiveBoxIcon} from "@heroicons/react/24/outline";

export const BackofficeCards = ({ titulo, info, link }: { titulo: string, info: string, link: string }) => {

    return (
        <Link to={link} className="no-underline">
            <motion.article
                className="pt-[22px] pl-[22px] pb-[20px] pr-[22px] group flex flex-col justify-between text-left w-[362px] h-[185px] bg-white text-lg hover:bg-black duration-250 ease z-20 rounded-xl"
            >
                <div className="flex items-center gap-[12px]">
                    <div className="h-[22px] w-[22px] flex items-center justify-center">
                        <ArchiveBoxIcon alt={titulo} className="group-hover:invert w-full h-full" />
                    </div>
                    <p className="text-black self-center group-hover:text-white text-lg">{titulo}</p>
                </div>

                <p className="text-black group-hover:text-white font-bold text-[25px]">{info}</p>
            </motion.article>
        </Link>
    );
}

export default BackofficeCards;