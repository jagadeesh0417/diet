import { memo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock3, Phone, Mail, Calendar, Navigation, MessageCircle } from "lucide-react";
import { useSite } from "../context/SiteContext";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const FALLBACK_MAP =
  "https://maps.google.com/maps?q=Bogadi%20Main%20Road%20Mysuru%20Karnataka%20570026&t=&z=14&ie=UTF8&iwloc=&output=embed";

const MAP_LINKS = {
  open: "https://www.google.com/maps/search/?api=1&query=Kshema+Healthcare+%23338+Bogadi+Main+Road+Mysuru+Karnataka+570026",
  bogadi: "https://www.google.com/maps/dir/?api=1&destination=Kshema+Healthcare+%23338+Bogadi+Main+Road+Mysuru+Karnataka+570026",
  roopanagar: "https://www.google.com/maps/dir/?api=1&destination=%231286+15A+Cross+Roopanagar+Mysuru",
};

function IconTile({ Icon }) {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary transition-transform duration-300 ease-out group-hover:scale-110">
      <Icon size={22} />
    </span>
  );
}

function InfoCard({ icon, title, badge, children, footer }) {
  return (
    <div className="group flex h-full flex-col rounded-[20px] border border-line bg-white p-7 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <IconTile Icon={icon} />
          <h3 className="font-heading text-[19px] font-semibold leading-snug text-ink">{title}</h3>
        </div>
        {badge}
      </div>
      <div className="mt-5 grow">{children}</div>
      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
}

function ClinicCard({ title, address, directionsUrl, badge }) {
  return (
    <InfoCard
      icon={MapPin}
      title={title}
      badge={badge}
      footer={
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get directions to ${title}`}
          className="btn-outline w-full !py-2.5 !text-sm transition-transform duration-300 ease-out hover:scale-[1.02]"
        >
          <Navigation size={16} /> Directions
        </a>
      }
    >
      <p className="whitespace-pre-line text-[15px] leading-[1.8] text-muted">{address}</p>
    </InfoCard>
  );
}

function BookingSection() {
  const { site } = useSite();
  const g = site.general || {};
  const phone = g.phone || "+91 934-267-4406";
  const whatsapp = g.whatsapp || "919342674406";
  const email = g.email || "nutrigolz@gmail.com";

  const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi! I'd like to book a nutrition consultation.")}`;

  return (
    <section className="bg-white py-[84px]">
      <div className="container-x">
        <SectionHeading
          title="Book Your Consultation"
          subtitle="Choose your preferred clinic and schedule a personalized nutrition consultation."
        />

        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Reveal className="h-full">
                <ClinicCard
                  title="Bogadi Clinic"
                  badge={<span className="rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold text-limeDark">Primary Clinic</span>}
                  directionsUrl={MAP_LINKS.bogadi}
                  address={`Kshema Healthcare\n#338\nBogadi Main Road\nBogadi\nMysuru – 570026`}
                />
              </Reveal>
              <Reveal delay={0.08} className="h-full">
                <ClinicCard
                  title="Roopanagar Clinic"
                  directionsUrl={MAP_LINKS.roopanagar}
                  address={`#1286\n15A Cross\nRoopanagar\nMysuru`}
                />
              </Reveal>
              <Reveal delay={0.16} className="h-full">
                <InfoCard icon={Clock3} title="Consultation Hours">
                  <div className="space-y-4 text-[15px] leading-relaxed">
                    <div>
                      <p className="font-semibold text-ink">Monday – Saturday</p>
                      <p className="mt-2 text-muted">Morning &nbsp;9:00 AM – 1:00 PM</p>
                      <p className="mt-1 text-muted">Evening &nbsp;4:30 PM – 8:00 PM</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Sunday</p>
                      <p className="mt-2 text-limeDark">Closed</p>
                    </div>
                  </div>
                </InfoCard>
              </Reveal>
              <Reveal delay={0.24} className="h-full">
                <InfoCard icon={Phone} title="Contact">
                  <ul className="space-y-3.5 text-[15px]">
                    <li>
                      <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-3 text-muted transition-colors duration-200 hover:text-primary">
                        <Phone size={17} className="shrink-0 text-primary" /> <span className="font-medium">{phone}</span>
                      </a>
                    </li>
                    <li>
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted transition-colors duration-200 hover:text-primary">
                        <MessageCircle size={17} className="shrink-0 text-primary" /> <span className="font-medium">WhatsApp</span>
                      </a>
                    </li>
                    <li>
                      <a href={`mailto:${email}`} className="flex items-center gap-3 text-muted transition-colors duration-200 hover:text-primary">
                        <Mail size={17} className="shrink-0 text-primary" /> <span className="font-medium">{email}</span>
                      </a>
                    </li>
                  </ul>
                </InfoCard>
              </Reveal>
            </div>

            <Reveal delay={0.3} className="mt-10">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/contact" className="btn-primary w-full transition-transform duration-300 ease-out hover:scale-[1.02] sm:w-auto">
                  <Calendar size={18} /> Book Consultation
                </Link>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full transition-transform duration-300 ease-out hover:scale-[1.02] sm:w-auto"
                >
                  <MessageCircle size={18} /> Chat on WhatsApp
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="h-full">
            <div className="flex h-full flex-col rounded-[24px] border border-line bg-white p-6 shadow-soft sm:p-8">
              <p className="mb-5 text-[15px] leading-[1.8] text-muted">
                Our clinics are conveniently located in Mysuru with easy accessibility and parking.
              </p>
              <div className="relative h-[300px] grow overflow-hidden rounded-[18px] shadow-soft lg:h-auto">
                <iframe
                  src={g.mapEmbed || FALLBACK_MAP}
                  title="GOLZ clinic locations map"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0"
                />
                <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-primary shadow-card backdrop-blur">
                  <MapPin size={15} /> Visit Our Clinic
                </span>
              </div>
              <a
                href={MAP_LINKS.open}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-6 w-full transition-transform duration-300 ease-out hover:scale-[1.02]"
              >
                <Navigation size={16} /> Open in Google Maps
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default memo(BookingSection);
