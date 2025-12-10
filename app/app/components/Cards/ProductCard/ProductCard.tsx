import { motion } from "motion/react"
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

export const ProductCard = ({ name, media, link }: { name: string, media: { image: string, hover: string }, link: string }) => {
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
                className="group flex flex-col text-left md:w-full max-w-[167px] md:h-full max-h-[340px] bg-white text-center text-lg hover:bg-black duration-250 ease z-20 rounded-xl pt-[10px] px-[6px] pb-[12px]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="w-[154px] h-[270px] rounded-[14px] bg-[#f3f3f3] relative overflow-hidden mb-[10px]">
                    <img
                        src={media.image}
                        className={`absolute inset-0 h-full w-full border-none rounded-[14px] object-cover transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? 'opacity-0' : 'opacity-100'}`}
                        alt={name}
                    />
                    {media.hover && (
                        mediaType === "video" ? (
                            <video
                                ref={videoRef}
                                src={media.hover}
                                className={`absolute inset-0 h-full w-full border-none rounded-[14px] object-cover transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={media.hover}
                                className={`absolute inset-0 h-full w-full border-none rounded-[14px] object-cover transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                                alt={name}
                            />
                        )
                    )}
                </div>
                <div className="flex justify-between items-start w-full">
                    <p className="text-black group-hover:text-white leading-[1.5] text-[13px] max-w-[79px]">{name}</p>
                </div>
            </motion.article>
        </Link>
    );
}

export default ProductCard;