import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { useSite } from "../context/SiteContext";

export default function FloatingWhatsAppButton() {
  const { site } = useSite();
  const { pathname } = useLocation();
  const number = site.general?.whatsapp || "919342674406";

  useEffect(() => {
    const ping = () => {
      fetch("/api/public/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
      }).catch(() => {});
    };
    ping();
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hi! I'd like to book a nutrition consultation.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-6 right-6 z-[9999] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 md:h-16 md:w-16"
    >
      <span
        className="wa-pulse pointer-events-none absolute inset-0 rounded-full bg-[#25D366]/50"
        aria-hidden="true"
      />
      <FaWhatsapp size={28} aria-hidden="true" className="md:hidden" />
      <FaWhatsapp size={34} aria-hidden="true" className="hidden md:block" />
      <span
        role="tooltip"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full right-0 mb-3 hidden whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-popup transition-opacity duration-200 group-hover:opacity-100 sm:block"
      >
        Chat on WhatsApp
      </span>
    </a>
  );
}
