import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { getMediaType } from "~/lib/utils";

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
  const hoverPreloadedRef = useRef(false);

  useEffect(() => {
    // Detect media types (image and hover can be image or video)
    setDefaultMediaType(getMediaType(media.image));
    setHoverMediaType(media.hover ? getMediaType(media.hover) : "image");
    hoverPreloadedRef.current = false;
    setIsMediaLoaded(!media.hover);
  }, [media.image, media.hover]);

  const preloadHoverMedia = () => {
    if (!media.hover || hoverPreloadedRef.current) return;
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
        className="group flex flex-col text-left bg-white text-center text-lg hover:bg-black duration-250 ease z-20 rounded-xl pt-2.5 px-1.5 pb-3"
        onMouseEnter={() => {
          preloadHoverMedia();
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full aspect-square rounded-xl bg-[#f3f3f3] relative overflow-hidden mb-2.5">
          {defaultMediaType === "video" ? (
            <video
              ref={defaultVideoRef}
              src={media.image}
              className={`absolute inset-0 h-full w-full border-none rounded-xl object-cover ${isHovered && isMediaLoaded ? "opacity-0" : "opacity-100"}`}
              loop
              muted
              playsInline
              autoPlay
            />
          ) : (
            <img
              src={media.image}
              className={`absolute inset-0 h-full w-full border-none rounded-xl object-cover ${isHovered && isMediaLoaded ? "opacity-0" : "opacity-100"}`}
              alt={name}
              loading="lazy"
              decoding="async"
            />
          )}
          {media.hover &&
            (hoverMediaType === "video" ? (
              <video
                ref={hoverVideoRef}
                src={media.hover}
                className={`absolute inset-0 h-full w-full border-none rounded-xl object-cover ${isHovered && isMediaLoaded ? "opacity-100" : "opacity-0"}`}
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={media.hover}
                className={`absolute inset-0 h-full w-full border-none rounded-xl object-cover ${isHovered && isMediaLoaded ? "opacity-100" : "opacity-0"}`}
                alt={name}
                loading="lazy"
                decoding="async"
              />
            ))}
        </div>
        <div className="flex justify-between items-start w-full">
          <p className="text-black group-hover:text-white leading-[1.5] text-xs">
            {name}
          </p>
        </div>
      </motion.article>
    </Link>
  );
};

export default ProductCard;
