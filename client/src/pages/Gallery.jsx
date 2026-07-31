import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import PageLoader from "../components/PageLoader";
import Lightbox, { PlayBadge } from "../components/Lightbox";
import LazyImage from "../components/LazyImage";
import { useSite } from "../context/SiteContext";

const PAGE_SIZE = 12;

export default function Gallery() {
  const { site } = useSite();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  const load = useCallback(async (cat, pg) => {
    setLoading(true);
    try {
      const { data } = await api.get("/public/gallery", { params: { category: cat, page: pg, limit: PAGE_SIZE } });
      setItems((prev) => (pg === 1 ? data.items : [...prev, ...data.items]));
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get("/public/gallery/categories").then(({ data }) => setCategories(["All", ...data]));
  }, []);

  useEffect(() => {
    setPage(1);
    load(category, 1);
  }, [category, load]);

  const open = (i) => setLightbox({ items, index: i });
  const navigate = useCallback((index) => setLightbox((lb) => (lb ? { ...lb, index } : lb)), []);

  return (
    <>
      <SEO
        title="Gallery"
        description="Recipes, client transformations, workshops, events and clinic photos from GOLZ (Giggles of Livez), Mysuru."
        keywords="nutrition gallery, healthy recipes, client transformations, diet clinic photos"
      />
      <PageHero
        title="Gallery"
        subtitle="Healthy recipes, real client transformations, workshops, seminars and life at the clinic."
        breadcrumb={["Gallery"]}
        image="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=70"
      />

      <section className="py-16">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5" role="tablist" aria-label="Gallery categories">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`chip ${category === c ? "chip-active" : ""}`}
                role="tab"
                aria-selected={category === c}
              >
                {c}
                {c === "All" && total > 0 && <span className="opacity-70">({total})</span>}
              </button>
            ))}
          </div>

          {loading && page === 1 ? (
            <PageLoader label="Loading gallery…" />
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.button
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}
                    onClick={() => open(i)}
                    className="group relative overflow-hidden rounded-2xl text-left shadow-card transition hover:shadow-lift"
                    aria-label={`Open ${item.type === "video" ? "video" : "image"} in lightbox`}
                  >
                    {item.type === "video" ? (
                      <>
                        <video src={item.url} muted className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <PlayBadge />
                      </>
                    ) : (
                      <LazyImage src={item.url} alt={item.alt || item.caption || "Gallery image"} className="aspect-[4/3] w-full" imgClassName="group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-charcoal/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      {item.category}
                    </span>
                    {item.caption && (
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent px-5 pb-4 pt-12 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                        {item.caption}
                      </span>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {page < pages && (
            <div className="mt-12 text-center">
              <button onClick={() => { const next = page + 1; setPage(next); load(category, next); }} disabled={loading} className="btn-outline">
                {loading ? "Loading…" : "Load More"} <ChevronDown size={17} />
              </button>
            </div>
          )}

          {!loading && items.length === 0 && (
            <p className="py-20 text-center text-charcoal/50">No media in this category yet — check back soon.</p>
          )}
        </div>
      </section>

      <AnimatePresence>
        {lightbox && <Lightbox items={lightbox.items} index={lightbox.index} onClose={() => setLightbox(null)} onNavigate={navigate} />}
      </AnimatePresence>
    </>
  );
}
