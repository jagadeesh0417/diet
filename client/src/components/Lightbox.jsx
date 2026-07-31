import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play } from "lucide-react";

/** Lightbox with zoom, navigation and keyboard support. */
export default function Lightbox({ items, index, onClose, onNavigate }) {
  const [zoom, setZoom] = useState(1);
  const item = items?.[index];

  const prev = useCallback(() => onNavigate((index - 1 + items.length) % items.length), [index, items, onNavigate]);
  const next = useCallback(() => onNavigate((index + 1) % items.length), [index, items, onNavigate]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  useEffect(() => setZoom(1), [index]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex flex-col bg-ink/60 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="max-w-[60%] truncate text-sm text-white/70">{item.caption || item.alt || "Media"}</span>
            <div className="flex items-center gap-2">
              {item.type !== "video" && (
                <>
                  <button onClick={() => setZoom((z) => Math.min(z + 0.5, 3))} className="rounded-full p-2 transition hover:bg-white/10" aria-label="Zoom in"><ZoomIn size={20} /></button>
                  <button onClick={() => setZoom((z) => Math.max(z - 0.5, 1))} className="rounded-full p-2 transition hover:bg-white/10" aria-label="Zoom out"><ZoomOut size={20} /></button>
                </>
              )}
              <button onClick={onClose} className="rounded-full p-2 transition hover:bg-white/10" aria-label="Close"><X size={22} /></button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-16 sm:px-16">
            <button onClick={prev} className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:left-6" aria-label="Previous"><ChevronLeft size={22} /></button>
            {item.type === "video" ? (
              <video src={item.url} controls autoPlay className="max-h-full max-w-full rounded-xl shadow-2xl" />
            ) : (
              <img
                src={item.url}
                alt={item.alt || item.caption || "Gallery image"}
                className="max-h-full max-w-full rounded-xl object-contain shadow-2xl transition-transform duration-300"
                style={{ transform: `scale(${zoom})` }}
              />
            )}
            <button onClick={next} className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:right-6" aria-label="Next"><ChevronRight size={22} /></button>
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80">
              {index + 1} / {items.length}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PlayBadge() {
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lift transition-transform duration-300 group-hover:scale-110">
        <Play size={22} className="ml-0.5 fill-primary" />
      </span>
    </span>
  );
}
