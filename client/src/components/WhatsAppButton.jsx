import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useSite } from "../context/SiteContext";

export default function WhatsAppButton() {
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
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform hover:scale-110"
    >
      <MessageCircle size={26} />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
    </a>
  );
}
