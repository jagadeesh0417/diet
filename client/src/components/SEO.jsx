import { useEffect } from "react";

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  if (content) el.setAttribute("content", content);
}

/** Lightweight client-side SEO: title, meta, Open Graph, Twitter and JSON-LD. */
export default function SEO({ title, description, image, keywords, jsonLd, canonical }) {
  const siteName = "GOLZ (Giggles of Livez)";

  useEffect(() => {
    document.title = title ? `${title} | ${siteName}` : siteName;
    upsertMeta("name", "description", description || "");
    upsertMeta("property", "og:title", document.title);
    upsertMeta("property", "og:description", description || "");
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:image", image || "");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", document.title);
    upsertMeta("name", "twitter:description", description || "");
    upsertMeta("name", "keywords", keywords || "");

    let link = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    } else if (link) {
      link.remove();
    }

    const id = "seo-jsonld";
    document.getElementById(id)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, image, keywords, jsonLd, canonical]);

  return null;
}
