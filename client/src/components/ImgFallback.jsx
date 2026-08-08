import { useState } from "react";

/** Renders an image with a clean "Image unavailable" fallback when the URL is broken or empty. */
export default function ImgFallback({ src, alt = "", className = "", fallbackClassName = "", children }) {
  const [broken, setBroken] = useState(false);
  const usable = typeof src === "string" && src.length > 0;

  if (broken || !usable) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-charcoal/5 text-center ${fallbackClassName || "h-full w-full p-3"} ${className}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/35" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="text-xs font-medium text-charcoal/45">Image unavailable</span>
        {children}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className={className}
    />
  );
}
