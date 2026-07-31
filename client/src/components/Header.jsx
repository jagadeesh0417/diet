import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, CalendarCheck, Leaf } from "lucide-react";
import { useSite } from "../context/SiteContext";

const NAV = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Gallery", to: "/gallery" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const { site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const name = site.general?.clinicName || "GOLZ (Giggles of Livez)";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-[rgba(247,248,245,0.86)] backdrop-blur-[10px] transition-shadow duration-300 ${
        scrolled ? "shadow-soft" : ""
      }`}
    >
      <div className="container-x flex h-[70px] items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Home">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary text-white shadow-soft">
            <Leaf size={22} />
          </span>
          <span className="leading-tight">
            <span className="block font-heading text-lg font-semibold text-ink">{name}</span>
            <span className="block text-[11px] tracking-wide text-muted">{site.general?.tagline || "Personalized Nutrition"}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-body text-[14.5px] font-medium transition ${
                  isActive ? "bg-primary/10 text-primary" : "text-ink/75 hover:bg-primary/5 hover:text-primary"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/contact" className="btn-primary hidden !px-5 !py-2.5 !text-sm sm:inline-flex">
            <CalendarCheck size={17} /> Book Consultation
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className={`rounded-xl p-2.5 transition lg:hidden ${open ? "bg-primary/10 text-primary" : "text-ink hover:bg-primary/5"}`}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-ink/10 bg-paper shadow-soft lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 font-body text-sm font-medium transition ${isActive ? "bg-primary/10 text-primary" : "text-ink/80 hover:bg-primary/5"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to="/contact" className="btn-primary mt-3">
                <CalendarCheck size={17} /> Book Consultation
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
