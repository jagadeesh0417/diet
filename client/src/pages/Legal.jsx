import SEO from "../components/SEO";
import PageHero from "../components/PageHero";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    text: [
      "At GOLZ (Giggles of Livez), we take your privacy seriously. This policy explains what information we collect, how we use it, and the choices you have.",
      "We collect information you provide directly — such as your name, phone number, email address and health-related details shared during consultations. This information is used solely to provide and improve our nutrition services, schedule appointments and respond to your enquiries.",
      "We do not sell, rent or trade your personal information to third parties. Health information is stored securely and only accessed by our clinical team.",
      "Our website uses basic analytics to understand which pages are visited, so we can improve the experience. No personally identifying information is tracked.",
      "You may request access to, correction of, or deletion of your personal data at any time by contacting us at the email address on this site.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    text: [
      "By using this website and our services, you agree to the following terms. Nutrition plans provided are for educational and informational purposes and are not a substitute for medical advice, diagnosis or treatment.",
      "Always consult your physician or qualified health provider regarding any medical condition. Never disregard professional medical advice because of something you read on this site.",
      "Consultation fees and program prices are as displayed at the time of booking. Payments are non-refundable once a consultation has been completed; rescheduling is available with 24 hours' notice.",
      "Our team will not share your health information with anyone outside the clinic without your explicit consent.",
      "We aim to keep all content accurate and current, but we make no guarantees about completeness or timeliness. We reserve the right to update these terms at any time.",
    ],
  },
};

export default function Legal({ type }) {
  const content = CONTENT[type] || CONTENT.privacy;
  return (
    <>
      <SEO title={content.title} description={`${content.title} for GOLZ (Giggles of Livez).`} />
      <PageHero title={content.title} breadcrumb={[content.title]} />
      <section className="section-pad">
        <div className="container-x max-w-3xl">
          <div className="space-y-6">
            {content.text.map((p) => (
              <p key={p.slice(0, 24)} className="leading-relaxed text-charcoal/70">{p}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
