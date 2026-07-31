# Nutrix Wellness — Nutrition Consultation Website

Premium, production-ready nutrition consultation website for a professional nutritionist/dietitian.
Full MERN stack: **React (Vite) + Tailwind CSS + Framer Motion** frontend, **Node.js + Express + MongoDB** backend, JWT admin panel, fully dynamic content.

## Features

### Public Website
- **Home** — animated hero, trust bar, about preview, services preview, why-choose-us, testimonial slider, gallery preview, latest blogs, CTA
- **About** — profile, mission/vision, qualifications, certifications, achievements, statistics, professional timeline
- **Services** — 12 program cards + detailed pages (benefits, suitability, duration, price, book consultation)
- **Gallery** — dynamic images/videos, category filters, load-more pagination, lazy loading, lightbox with zoom
- **Blog** — search, category filters, tags, pagination, popular posts, related articles, share buttons, reading time
- **Contact** — message form **and** consultation booking form (service + preferred date/time), Google Map, working hours, FAQ, WhatsApp floating button
- **Legal pages**, 404 page, newsletter subscription, SEO meta + Open Graph, JSON-LD schema, `robots.txt` + `sitemap.xml`

### Admin Panel (`/admin`)
- **Dashboard** — overview cards, 14-day visitor analytics chart, top pages, recent activity, recent messages/appointments
- **Services** — full CRUD, icons, images, pricing, publish/hide, drag-to-reorder
- **Blogs** — rich text editor with image upload, drafts, scheduled publishing (cron), featured images, SEO title/meta, slug generation, duplicate, publish/unpublish
- **Gallery** — bulk upload, edit caption/category/alt text, feature, publish/hide, bulk delete, drag-to-reorder, lightbox preview
- **Media Library** — centralized uploads, search, rename (updates references site-wide), delete, preview, copy URL
- **Testimonials** — CRUD, client photos, ratings, feature, show/hide
- **Messages & Appointments** — read/unread, reply status, delete, export CSV, appointment status management
- **Settings & SEO** — clinic info, logo, contact details, WhatsApp, address, map embed, socials, working hours, hero/about/homepage content, meta title/description/keywords, OG image, favicon, robots.txt
- **Security** — JWT httpOnly cookies, bcrypt password hashing, role-based access (admin/editor), rate-limited login, 30-minute idle session timeout, full activity logs, user management

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, Tailwind CSS, Framer Motion, React Router, React Hook Form, Axios, Lucide icons |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs, multer, helmet, cors, express-rate-limit, node-cron |
| Database | MongoDB (local or Atlas) — falls back to in-memory MongoDB for zero-setup dev |
| Storage | Local `server/uploads` by default; optional Cloudinary for cloud image/video hosting |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (optional — server auto-falls back to in-memory MongoDB for development)

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Set `JWT_SECRET` to a long random string. `MONGO_URI` is optional —
leave empty for local/in-memory MongoDB. Add Cloudinary credentials to enable
cloud media storage (optional).

### 3. Run (development)

```bash
npm run dev
```

- Website: http://localhost:5173
- API: http://localhost:5000
- Admin panel: http://localhost:5173/admin

The server auto-seeds demo content (12 services, 6 blogs, 13 gallery items,
6 testimonials, settings) on first start.

**Default admin login:** `admin@nutrix.com` / `Admin@123`
> Change this password immediately after first login (Settings → Security).

### 4. Production build

```bash
npm run build        # builds the client
npm start            # Express serves the built site + API on :5000
```

Visit http://localhost:5000 — the admin panel lives at `/admin`.

## Project Structure

```
nutrix/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/             # Home, About, Services, Gallery, Blog, BlogPost, Contact, Legal
│   │   ├── components/        # Header, Footer, shared UI, SEO, Lightbox, sliders…
│   │   ├── admin/             # Admin panel pages + shared admin UI
│   │   ├── context/           # SiteContext (public data), AuthContext (JWT session)
│   │   ├── api/client.js      # Axios instance (credentials, 401 handling)
│   │   └── utils/helpers.js   # formatters, slugify, icon map
│   └── tailwind.config.js     # brand colors, fonts, shadows, animations
└── server/                    # Express API
    ├── src/
    │   ├── routes/            # public + admin REST routes
    │   ├── models/            # Mongoose schemas (Service, Blog, GalleryItem, …)
    │   ├── middleware/        # auth (JWT), upload (multer), visit tracking
    │   ├── config/            # db (with in-memory fallback), cloudinary
    │   ├── seed.js            # demo content seeder
    │   └── index.js           # app entry, cron scheduler, SEO endpoints
    └── uploads/               # local media storage
```

## Key API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/public/site` | Aggregated site data (settings, services, blogs, gallery, testimonials) |
| `GET /api/public/services`, `/blogs`, `/gallery`, `/testimonials` | Public listings with filters & pagination |
| `POST /api/public/contact` | Contact form submissions |
| `POST /api/public/appointments` | Consultation booking requests |
| `POST /api/public/subscribe` | Newsletter subscriptions |
| `POST /api/public/visit` | Visitor analytics ping |
| `POST /api/auth/login` | Admin login (httpOnly JWT cookie) |
| `/api/admin/*` | Protected CRUD for services, blogs, gallery, media, testimonials, messages, settings, dashboard |
| `GET /robots.txt`, `GET /sitemap.xml` | SEO endpoints |

## Deployment Notes

- Set `MONGO_URI` to MongoDB Atlas and `JWT_SECRET` to a strong secret
- Set `NODE_ENV=production` (enables secure cookies)
- Optional: Cloudinary credentials for cloud-hosted media
- Point `SITE_URL` env var to your domain for correct sitemap URLs

## Extending

The architecture is ready for future additions: appointment booking with payments,
online consultation video links, multilingual content (content already lives in
DB-driven settings), and additional admin roles.
