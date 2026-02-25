import { motion } from "framer-motion";
import { getMediaType } from "~/lib/utils";
import { ThreeSixtyViewer } from "./ThreeSixtyViewer";

export type MediaSlot =
  | { type: "360"; frames: string[] }
  | { type: "image"; url: string };

interface ProductMediaViewProps {
  /** 360° frame URLs (shown as first option when present) */
  media360: string[];
  /** Gallery images/videos (main image + extra) */
  media: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  productName: string;
}

function buildSlots(media360: string[], media: string[]): MediaSlot[] {
  const slots: MediaSlot[] = [];
  if (media360.length > 0) slots.push({ type: "360", frames: media360 });
  media.forEach((url) => slots.push({ type: "image", url }));
  return slots;
}

/** Thumbnail image for a slot (first frame for 360, or the image url) */
function slotThumbSrc(slot: MediaSlot): string {
  if (slot.type === "360") return slot.frames[0] ?? "";
  return slot.url;
}

function Icon360({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

export const ProductMediaView = ({
  media360,
  media,
  selectedIndex,
  onSelectIndex,
  productName,
}: ProductMediaViewProps) => {
  const slots = buildSlots(media360, media);

  if (slots.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#f1f1f1] text-slate-500 text-sm">
        Sem imagens
      </div>
    );
  }

  const current = slots[selectedIndex];
  const is360 = current?.type === "360";
  const showUrl = current?.type === "image" ? current.url : null;
  const showIsVideo = showUrl ? getMediaType(showUrl) === "video" : false;

  return (
    <div className="w-full relative h-full">
      {/* Main view: 360 or single image/video */}
      <motion.div
        key={is360 ? "360" : selectedIndex}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute inset-0 bg-white"
      >
        {is360 && current.type === "360" ? (
          <ThreeSixtyViewer
            images={current.frames}
            productName={productName}
          />
        ) : showUrl ? (
          showIsVideo ? (
            <video
              src={showUrl}
              className="w-full h-full object-cover"
              controls
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={showUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          )
        ) : null}
      </motion.div>

      {/* Square thumbnails */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2.5 z-10 flex-wrap justify-center max-w-full px-4">
        {slots.map((slot, index) => {
          const thumbSrc = slotThumbSrc(slot);
          const isVideo = slot.type === "image" && getMediaType(slot.url) === "video";
          const selected = selectedIndex === index;
          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.3 }}
              onClick={() => onSelectIndex(index)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                selected
                  ? "border-black ring-2 ring-black/10 scale-105"
                  : "border-slate-200 hover:border-slate-400"
              }`}
              aria-pressed={selected}
              aria-label={
                slot.type === "360"
                  ? "Vista 360°"
                  : `${productName} ${index + 1}`
              }
            >
              {slot.type === "360" ? (
                <>
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt="360°"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100 text-slate-600 text-xs font-medium" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <Icon360 className="size-6 text-white drop-shadow-sm" />
                  </span>
                </>
              ) : thumbSrc ? (
                isVideo ? (
                  <video
                    src={thumbSrc}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={thumbSrc}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
