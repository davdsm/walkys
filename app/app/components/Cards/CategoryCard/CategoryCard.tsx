import { motion } from "motion/react"
import { useState, useEffect, useRef } from "react";
import { Button } from "../../Elements/Button/Button";
import { Link } from "react-router";

export const CategoryCard = ({ name, description, media, link }: { name: string, description: string, media: { image: string, hover: string }, link: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMediaLoaded, setIsMediaLoaded] = useState(false);
    const [defaultMediaType, setDefaultMediaType] = useState<"image" | "video">("image");
    const [hoverMediaType, setHoverMediaType] = useState<"image" | "video">("image");
    const defaultVideoRef = useRef<HTMLVideoElement>(null);
    const hoverVideoRef = useRef<HTMLVideoElement>(null);

    const getMediaType = (url: string): "image" | "video" => {
        const extension = url.split('.').pop()?.toLowerCase();
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
        return videoExtensions.includes(extension || '') ? "video" : "image";
    }

    useEffect(() => {
        // Detect media types
        setDefaultMediaType(getMediaType(media.image));
        setHoverMediaType(getMediaType(media.hover));

        // Preload hover media
        if (getMediaType(media.hover) === "video") {
            const video = document.createElement('video');
            video.src = media.hover;
            video.onloadeddata = () => setIsMediaLoaded(true);
            video.load();
        } else {
            const img = new Image();
            img.src = media.hover;
            img.onload = () => setIsMediaLoaded(true);
        }

    }, [media.image, media.hover]);

    useEffect(() => {
        // Handle default video autoplay
        if (defaultVideoRef.current && !isHovered) {
            defaultVideoRef.current.play();
        }

        // Handle hover video
        if (hoverVideoRef.current) {
            if (isHovered) {
                hoverVideoRef.current.play();
                hoverVideoRef.current.loop = true;
            } else {
                hoverVideoRef.current.pause();
                hoverVideoRef.current.currentTime = 0; // Comment to have pause and play
            }
        }

        // Pause and reset default video when hovered
        if (defaultVideoRef.current) {
            if (isHovered) {
                defaultVideoRef.current.pause();
                defaultVideoRef.current.currentTime = 0;
            } else {
                defaultVideoRef.current.play();
            }
        }
    }, [isHovered]);

    return (
        <Link to={link} className="no-underline">
            <motion.article
                className="group flex flex-col text-left md:w-full max-w-[402px] md:h-full max-h-[227px] bg-white text-center text-lg hover:bg-black duration-250 ease z-20 rounded-xl pt-[12px] pb-[18px] pr-[10px] pl-[10px]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="mb-[12px] h-[145px] w-full bg-[#f3f3f3] rounded-[10px] relative overflow-hidden">
                    {defaultMediaType === "video" ? (
                        <video
                           ref={defaultVideoRef}
                           src={media.image}
                           className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-cover transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? 'opacity-0' : 'opacity-100'}`} 
                           loop
                           muted
                           playsInline
                           autoPlay
                        />
                    ): (
                        <img
                            src={media.image}
                            className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-cover transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? 'opacity-0' : 'opacity-100'}`}
                            alt={name}
                        />
                    )}
                    {hoverMediaType === "video" ? (
                        <video
                            ref={hoverVideoRef}
                            src={media.hover}
                            className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-cover transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                            loop
                            muted
                            playsInline
                        />
                    ) : (
                        <img
                            src={media.hover}
                            className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-cover transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                            alt={name}
                        />
                    )}
                </div>
                <div className="flex justify-between items-center gap-4 md:w-full max-w-[382px] md:h-full max-h-[40px]">
                    <div className="transition group-hover:text-white">
                        <p className="text-black group-hover:text-white text-base font-bold">{name}</p>
                        <p className="text-black group-hover:text-white text-sm">{description}</p>
                    </div>
                    <div className="h-[40px] w-[127px]">
                        <Button to={link} className="group-hover:bg-white group-hover:text-black h-full w-full" size="sm">
                            SHOP NOW
                        </Button>
                    </div>
                </div>
            </motion.article>
        </Link>
    );
}

export default CategoryCard;