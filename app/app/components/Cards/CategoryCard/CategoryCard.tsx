import { motion } from "motion/react"
import { useState, useEffect, useRef } from "react";
import { Button } from "../../Elements/Button/Button";
import { Link } from "react-router";

export const CategoryCard = ({ name, description, media, link }: { name: string, description: string, media: { image: string, hover: string }, link: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMediaLoaded, setIsMediaLoaded] = useState(false);
    const [mediaType, setMediaType] = useState<"image" | "video">("image");
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Detect media type based on file extension
        const extension = media.hover.split('.').pop()?.toLowerCase();
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
        const isVideo = videoExtensions.includes(extension || '');
        setMediaType(isVideo ? "video" : "image");

        // Preload media
        if (isVideo) {
            const video = document.createElement('video');
            video.src = media.hover;
            video.onloadeddata = () => setIsMediaLoaded(true);
            video.load();
        } else {
            const img = new Image();
            img.src = media.hover;
            img.onload = () => setIsMediaLoaded(true);
        }
    }, [media.hover]);

    useEffect(() => {
        if (videoRef.current) {
            if (isHovered) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0; // Comment to have pause and play
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
                    <img
                        src={media.image}
                        className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-cover transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? 'opacity-0' : 'opacity-100'}`}
                        alt={name}
                    />
                    {mediaType === "video" ? (
                        <video
                            ref={videoRef}
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