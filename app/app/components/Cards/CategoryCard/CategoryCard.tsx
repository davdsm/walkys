import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { getMediaType } from "~/lib/utils";

export const CategoryCard = ({
  name,
  description = "",
  media,
  link,
}: {
  name: string;
  description?: string;
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
  const hasHover = !!(media.hover && media.hover.trim());
  const hoverPreloadedRef = useRef(false);

  useEffect(() => {
    // Detect media types (image and hover can be image or video)
    setDefaultMediaType(getMediaType(media.image));
    setHoverMediaType(media.hover ? getMediaType(media.hover) : "image");
    hoverPreloadedRef.current = false;
    setIsMediaLoaded(!hasHover);
  }, [media.image, media.hover]);

  const preloadHoverMedia = () => {
    if (!hasHover || hoverPreloadedRef.current) return;
    hoverPreloadedRef.current = true;
    if (getMediaType(media.hover) === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = media.hover;
      video.onloadeddata = () => setIsMediaLoaded(true);
      video.load();
      return;
    }
    const img = new Image();
    img.src = media.hover;
    img.decoding = "async";
    img.onload = () => setIsMediaLoaded(true);
  };

  useEffect(() => {
    // Handle default video autoplay
    if (defaultVideoRef.current && (!hasHover || !isHovered)) {
      defaultVideoRef.current.play();
    }

    // Handle hover video (only when hover media exists)
    if (hasHover && hoverVideoRef.current) {
      if (isHovered) {
        hoverVideoRef.current.play();
        hoverVideoRef.current.loop = true;
      } else {
        hoverVideoRef.current.pause();
        hoverVideoRef.current.currentTime = 0;
      }
    }

    // Pause default video when hovered and hover media exists
    if (hasHover && defaultVideoRef.current) {
      if (isHovered) {
        defaultVideoRef.current.pause();
        defaultVideoRef.current.currentTime = 0;
      } else {
        defaultVideoRef.current.play();
      }
    }
  }, [isHovered, hasHover]);

  return (
    <Link to={link} className="no-underline">
      <motion.article
        className="group flex flex-col text-left md:w-full md:h-full max-h-[227px] md:max-h-[327px] bg-white text-center text-lg hover:bg-black duration-250 ease z-20 rounded-xl pt-[12px] pb-[18px] pr-[10px] pl-[10px]"
        onMouseEnter={() => {
          preloadHoverMedia();
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="mb-[12px] h-[145px] md:h-[345px] w-full bg-[#f3f3f3] rounded-[10px] relative overflow-hidden">
          {defaultMediaType === "video" ? (
            <video
              ref={defaultVideoRef}
              src={media.image}
              className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-cover transition-opacity duration-300 ease-in ${hasHover && isHovered && isMediaLoaded ? "opacity-0" : "opacity-100"}`}
              loop
              muted
              playsInline
              autoPlay
            />
          ) : (
            <img
              src={media.image}
              className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-cover transition-opacity duration-300 ease-in ${hasHover && isHovered && isMediaLoaded ? "opacity-0" : "opacity-100"}`}
              alt={name}
              loading="lazy"
              decoding="async"
            />
          )}
          {hasHover &&
            (hoverMediaType === "video" ? (
              <video
                ref={hoverVideoRef}
                src={media.hover}
                className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-cover transition-opacity duration-300 ease-in ${hasHover && isHovered && isMediaLoaded ? "opacity-100" : "opacity-0"}`}
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={media.hover}
                className={`absolute inset-0 h-full w-full border-none rounded-[10px] object-cover transition-opacity duration-300 ease-in ${hasHover && isHovered && isMediaLoaded ? "opacity-100" : "opacity-0"}`}
                alt={name}
                loading="lazy"
                decoding="async"
              />
            ))}
        </div>
        <div className="flex justify-between items-center gap-4 md:w-full md:h-full max-h-[40px]">
          <div className="transition group-hover:text-white">
            <p className="text-black group-hover:text-white text-base font-bold">
              {name}
            </p>
            {description ? (
              <p className="text-black group-hover:text-white text-sm whitespace-pre-line">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </motion.article>
    </Link>
  );
};

export default CategoryCard;
