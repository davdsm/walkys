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
              loading="eager"
              decoding="async"
            />
          )
        ) : null}
      </motion.div>
    </div>
  );
};
