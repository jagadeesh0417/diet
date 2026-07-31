import { useState } from "react";

/** Lazy image with fade-in and blur-up placeholder. */
export default function LazyImage({ src, alt = "", className = "", imgClassName = "" }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-700 ${loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"} ${imgClassName}`}
      />
    </div>
  );
}
