import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ThreeSixtyViewerProps {
  images: string[];
  productName: string;
}

export const ThreeSixtyViewer = ({
  images,
  productName,
}: ThreeSixtyViewerProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentFrameRef = useRef(0);
  const count = images.length;

  useEffect(() => {
    currentFrameRef.current = currentFrame;
  }, [currentFrame]);

  const goToFrame = useCallback(
    (index: number) => {
      if (count === 0) return;
      const next = ((index % count) + count) % count;
      setCurrentFrame(next);
    },
    [count],
  );

  const goPrev = useCallback(() => goToFrame(currentFrame - 1), [currentFrame, goToFrame]);
  const goNext = useCallback(() => goToFrame(currentFrame + 1), [currentFrame, goToFrame]);

  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startFrameRef = useRef(0);

  // Drag to rotate
  useEffect(() => {
    if (count === 0) return;
    const el = containerRef.current;
    if (!el) return;

    const sensitivity = 15; // pixels per frame

    const onPointerDown = (e: PointerEvent) => {
      startXRef.current = e.clientX;
      startFrameRef.current = currentFrameRef.current;
      draggingRef.current = true;
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - startXRef.current;
      const deltaFrames = Math.floor(dx / sensitivity);
      goToFrame(startFrameRef.current + deltaFrames);
    };

    const onPointerUp = () => {
      draggingRef.current = false;
      setIsDragging(false);
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [count, currentFrame, goToFrame]);

  const toImgSrc = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  // Preload all 360° images and wait for decode so rotation has zero white flash
  useEffect(() => {
    if (images.length === 0) {
      setIsReady(true);
      return;
    }
    let cancelled = false;
    const urls = images.map((url) => toImgSrc(url)).filter(Boolean);
    const loadPromises = urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (img.decode) {
              img.decode().then(() => resolve()).catch(() => resolve());
            } else {
              resolve();
            }
          };
          img.onerror = () => resolve();
          img.src = url;
        })
    );
    Promise.all(loadPromises).then(() => {
      if (!cancelled) setIsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [images]);

  if (count === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
        No 360° images
      </div>
    );
  }

  const urls = images.map((url) => toImgSrc(url)).filter(Boolean);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full h-full relative bg-white overflow-hidden select-none touch-none"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        )}
        {/* Render all frames so they stay in DOM and decoded; only current is visible — no white flash on rotate */}
        {urls.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={index === currentFrame ? `${productName} 360° view ${index + 1}` : ""}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ opacity: index === currentFrame ? 1 : 0, zIndex: index === currentFrame ? 1 : 0 }}
            draggable={false}
            decoding="async"
          />
        ))}
      </div>

      {/* Prev / Next */}
      <button
        type="button"
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all"
        aria-label={`Anterior - ${productName}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all"
        aria-label={`Seguinte - ${productName}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Frame indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-xs text-black/60 bg-white/80 px-2 py-1 rounded">
        {currentFrame + 1} / {count}
      </div>
    </motion.div>
  );
};
