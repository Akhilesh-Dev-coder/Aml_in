# AML.IN — Premium AI Advertising Creator Portfolio & Studio CMS

A bespoke, cinematic portfolio website engineered for an independent AI advertising creator and commercial director producing AI-generated commercials, product advertisements, cinematic visuals, and brand campaigns.

Built with an editorial aesthetic inspired by high-end studio showcases, featuring an uncompromising **black-and-electric-yellow** visual identity.

---

## Visual & Brand Identity

- **Primary Background:** `#050505` (Deep void black)
- **Secondary Background:** `#111111` (Matte dark surface)
- **Card Background:** `#171717` (Subtle glass-like cards)
- **Primary Accent:** `#F5D90A` (Electric yellow, used surgically on badges, CTAs, keyword accents, and hover indicators)
- **Typography:** Google Fonts Geist with high-contrast editorial sizing and italic serif accents
- **Borders:** `rgba(255, 255, 255, 0.12)` with yellow glow highlights on hover

---

## Features

### Public Portfolio
1. **Cinematic Hero:** Asymmetric layout featuring oversized editorial typography, floating director spec badges, glowing ambient yellow aura, and a featured 4K commercial reel.
2. **Asymmetric Selected Work Grid:** Curated commercial cards with varying aspect ratios (`16:9` wide, `4:5` tall), subtle video hover preview on desktop, and category filtering.
3. **Interactive Cinematic Viewer Modal:** Fullscreen video player with custom scrub bar, play/pause, volume control, keyboard shortcuts (`Space`, `←`, `→`, `Esc`), and metadata inspection.
4. **Editorial Creative Capabilities:** 5 numbered disciplines `(01) - (05)` showcasing AI Product Commercials, Brand Films, Haute Beauty Spots, Surreal VFX, and High-Octane Social Creatives.
5. **Director Philosophy & Manifesto:** High-impact narrative framing the creator as an autonomous director with singular vision.
6. **Closing Direct Inquiry Section:** "Have a product worth making unforgettable?" with direct email copy, WhatsApp link, and Instagram channel.

### Studio Admin CMS (`/admin`)
1. **Secure Admin Authentication:**
   - Single-admin architecture (no public registration).
   - JWT tokens signed with `jose` stored in secure, `HttpOnly` cookies.
   - Protected API routes and Next.js middleware guarding all `/admin/*` views.
2. **Direct Browser-to-Cloudinary Uploads:**
   - Server-signed upload signatures preventing exposure of Cloudinary API secrets.
   - Direct-from-browser uploads bypassing Vercel body-size limits.
   - Real-time percentage upload progress bars for both 4K videos and poster thumbnails.
3. **Full Project CRUD:**
   - Create, edit, reorder (move up/down), publish/unpublish toggle, featured star toggle, and safe delete.
4. **Resilient Data Architecture:**
   - MongoDB Atlas connection caching suitable for serverless deployments.
   - Automatic seeding on first run.
   - Graceful fallback dataset if MongoDB or Cloudinary keys are not yet configured.

---

## Technology Stack

- **Framework:** Next.js 16.4 (App Router, Turbopack, React 19)
- **Styling:** Tailwind CSS v4 (Inline `@theme` design tokens)
- **Animations:** GSAP (Selective entrance motion respecting `prefers-reduced-motion`)
- **Database:** MongoDB Atlas via Mongoose
- **Media CDN:** Cloudinary (Direct browser uploads & responsive video delivery)
- **Icons:** Lucide React
- **Security:** Jose (JWT), BcryptJS, HttpOnly session cookies

---

## Environment Configuration

Create a `.env.local` file in the `client/` directory with the following variables:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_portfolio?retryWrites=true&w=majority

# Admin Authentication
ADMIN_USERNAME=admin@aml.in
ADMIN_PASSWORD=admin@123
# Or ADMIN_PASSWORD_HASH=$2a$10$...
JWT_SECRET=aml_creative_studio_jwt_secret_key_minimum_32_characters_2025

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Production Site URL
NEXT_PUBLIC_SITE_URL=https://aml.in
```

---

## Getting Started

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Access the Studio CMS at [http://localhost:3000/admin](http://localhost:3000/admin) (Default credentials: `admin@aml.in` / `admin@123`).

---

## Production Build & Deployment

To build for production (e.g. Vercel):

```bash
cd client
npm run build
npm run start
```
