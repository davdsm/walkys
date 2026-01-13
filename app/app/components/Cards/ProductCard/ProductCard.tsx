import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

export const ProductCard = ({
  name,
  media,
  link,
}: {
  name: string;
  media: { image: string; hover: string };
  link: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [defaultMediaType, setDefaultMediaType] = useState<"image" | "video">(
    "image"
  );
  const [hoverMediaType, setHoverMediaType] = useState<"image" | "video">(
    "image"
  );
  const defaultVideoRef = useRef<HTMLVideoElement>(null);
  const hoverVideoRef = useRef<HTMLVideoElement>(null);

  const getMediaType = (url: string): "image" | "video" => {
    const extension = url.split(".").pop()?.toLowerCase();
    const videoExtensions = ["mp4", "webm", "ogg", "mov"];
    return videoExtensions.includes(extension || "") ? "video" : "image";
  };

  useEffect(() => {
    // Detect media types
    setDefaultMediaType(getMediaType(media.image));
    setHoverMediaType(getMediaType(media.hover));

    // Preload hover media
    if (getMediaType(media.hover) === "video") {
      const video = document.createElement("video");
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
        className="group flex flex-col text-left bg-white text-center text-lg hover:bg-black duration-250 ease z-20 rounded-xl pt-[10px] px-[6px] pb-[12px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full md:w-full h-[270px] rounded-[14px] bg-[#f3f3f3] relative overflow-hidden mb-[10px]">
          {defaultMediaType === "video" ? (
            <video
              ref={defaultVideoRef}
              src={media.image}
              className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-contain transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? "opacity-0" : "opacity-100"}`}
              loop
              muted
              playsInline
              autoPlay
            />
          ) : (
            <img
              src={media.image}
              className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-contain transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? "opacity-0" : "opacity-100"}`}
              alt={name}
            />
          )}
          {media.hover &&
            (hoverMediaType === "video" ? (
              <video
                ref={hoverVideoRef}
                src={media.hover}
                className={`absolute inset-0 h-full w-full border-none rounded-[14px] object-cover transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? "opacity-100" : "opacity-0"}`}
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={media.hover}
                className={`absolute inset-0 h-full w-full border-none rounded-[14px] object-contain transition-opacity duration-300 ease-in ${isHovered && isMediaLoaded ? "opacity-100" : "opacity-0"}`}
                alt={name}
              />
            ))}
        </div>
        <div className="flex justify-between items-start w-full">
          <p className="text-black group-hover:text-white leading-[1.5] text-[13px] max-w-[79px]">
            {name}
          </p>
        </div>
      </motion.article>
    </Link>
  );
};

export default ProductCard;
