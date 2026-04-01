import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";

export const HomepageCard = ({
    variant = "light",
    cardImage,
    title,
    subtitle,
    link,
}: {
    variant?: "light" | "dark";
    cardImage: {
        image?: string;
        video?: string;
    };
    title: string;
    subtitle: string;
    link: string;
}) => {
    const getVideoMimeType = (url: string): string => {
        const extension = url.split(".").pop()?.toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            mp4: "video/mp4",
            webm: "video/webm",
            ogg: "video/ogg",
            mov: "video/quicktime",
        };
        return mimeTypes[extension || ""] || "video/mp4";
    };

    return (
        <Link to={link} className="no-underline cursor-pointer">
            <motion.article className={`w-full max-w-full min-h-[20rem] h-[min(32rem,85svh)] md:h-[40rem] relative overflow-hidden ${variant === "dark" ? "bg-black" : "bg-white"} md:p-9 rounded-2xl md:rounded-4xl flex flex-col md:flex-row`}>
                <div className="w-full h-full md:w-2/3 md:h-full">
                    {cardImage.video ? (
                        <video
                            aria-label={title}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover rounded-4xl"
                        >
                            <source src={cardImage.video} type={getVideoMimeType(cardImage.video)} />
                        </video>
                    ) : cardImage.image ? (
                        <img
                            src={cardImage.image}
                            alt={title}
                            className="w-full h-full object-cover rounded-4xl"
                        />
                    ) : null}
                </div>
                <div
                  className={`absolute md:relative md:flex md:flex-col md:justify-end bottom-0 z-10 px-5 pb-8 pt-4 md:pt-0 md:pb-20 md:pl-20 md:w-full rounded-b-2xl md:rounded-none ${
                    variant === "dark"
                      ? "bg-gradient-to-t from-black/85 via-black/45 to-transparent md:bg-none"
                      : "bg-white/90 backdrop-blur-sm md:bg-transparent"
                  }`}
                >
                    <h2 className={`uppercase text-xl sm:text-2xl font-bold md:text-7xl font-display ${variant === "dark" ? "text-white" : "text-black"}`}>{title}</h2>
                    <p className={`text-xs sm:text-sm mt-3 md:mt-5 max-w-full md:max-w-3xl md:text-3xl whitespace-pre-line line-clamp-4 md:line-clamp-none ${variant === "dark" ? "text-white" : "text-black"}`}>{subtitle}</p>
                </div>
            </motion.article>
        </Link>
    );
};

export default HomepageCard;