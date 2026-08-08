import { useState } from "react";

/** Lazy image with fade-in and blur-up placeholder. Pass `natural` to keep the image's own aspect ratio. */
export default function LazyImage({ src, alt = "", className = "", imgClassName = "", natural = false }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`transition-all duration-700 ${loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"} ${natural ? "h-auto w-full object-contain" : "h-full w-full object-cover"} ${imgClassName}`}
      />
    </div>
  );
}
