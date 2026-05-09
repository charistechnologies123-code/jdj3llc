# JDJ3LLC

JDJ3LLC is the live Next.js storefront and admin rebuild of the original Laravel app. The old PHP code is still kept in `laravel/` only as reference while parity work continues.

## Stack

- Next.js App Router
- Prisma ORM
- Supabase Postgres
- Tailwind CSS
- Vercel target deployment

## Project Layout

- `app/`
  App Router pages and API routes
- `components/`
  Reusable UI, providers, forms, shells, and interactive controls
- `lib/`
  Prisma access, auth helpers, catalog helpers, upload helpers, and admin data loaders
- `prisma/`
  Prisma schema and migrations
- `public/`
  static assets and local uploaded files
- `scripts/`
  database utility scripts
- `laravel/`
  old app kept as migration reference only

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill in the Supabase connection strings
3. Run `npm install`
4. Run `npm run prisma:generate`
5. Run `npm run dev`

## Database Commands

- `npm run prisma:generate`
  Regenerates Prisma client after schema changes
- `npm run prisma:deploy`
  Applies committed Prisma migrations
- `npm run db:clear`
  Wipes application records while keeping the schema
- `npm run db:create-admin`
  Creates or resets the admin account:
  - email: `admin@jdj3llc.com`
  - password: `Admin@1234`

## Environment Notes

- `DATABASE_URL`
  Runtime DB connection for the app
- `DIRECT_URL`
  Direct DB connection for Prisma commands and scripts
- `NEXT_PUBLIC_SITE_URL`
  Local or deployed base URL

## Image Uploads

- uploads are file-based, not URL-based
- max upload size is `200 KB`
- current local storage path is under `public/uploads`
- upload endpoint is `app/api/uploads/route.ts`

For production on Vercel, local disk is not durable across deployments, so this should later move to persistent object storage such as Vercel Blob or Supabase Storage.

## What To Edit

### Storefront pages

- Home page:
  `app/page.tsx`
- Shop page:
  `app/shop/page.tsx`
- Product details:
  `app/products/[slug]/page.tsx`
- Cart:
  `app/cart/page.tsx`
- Checkout:
  `app/checkout/page.tsx`
- About / FAQs / Testimonials:
  `app/about/page.tsx`
  `app/faqs/page.tsx`
  `app/testimonials/page.tsx`

### Navigation, branding, and footer

- Navbar:
  `components/store-header.tsx`
- Footer:
  `components/store-footer.tsx`
- Global layout:
  `app/layout.tsx`
- Site-wide contact and brand text:
  `lib/site.ts`
- Brand logo source:
  admin avatar/logo uploaded from admin profile, exposed by `app/api/branding/route.ts`

### Customer auth and profile

- Customer login:
  `app/login/page.tsx`
- Registration:
  `components/register-form.tsx`
- Profile page:
  `app/profile/page.tsx`
- Auth state/provider:
  `components/auth-provider.tsx`
- Login/register/profile APIs:
  `app/api/auth/*`
  `app/api/account/route.ts`
  `app/api/addresses/*`

### Admin portal

- Admin login page:
  `app/admin-login/page.tsx`
- Admin shell/layout:
  `components/admin-shell.tsx`
- Admin dashboard:
  `app/admin/page.tsx`
- Admin profile:
  `app/admin/profile/page.tsx`
  `components/admin-profile-panel.tsx`
- Admin data loaders:
  `lib/admin.ts`

### Product management

- Product list:
  `app/admin/products/page.tsx`
- Create product page:
  `app/admin/products/create/page.tsx`
- Edit product page:
  `app/admin/products/[id]/edit/page.tsx`
- Shared admin product form:
  `components/admin-product-form.tsx`

### Orders

- Customer checkout submission:
  `app/api/orders/route.ts`
- Admin orders list:
  `app/admin/orders/page.tsx`
- Admin order details:
  `app/admin/orders/[id]/page.tsx`

### Reviews, coupons, FAQs, testimonials

- Reviews:
  `app/admin/reviews/page.tsx`
- Coupons:
  `app/admin/coupons/page.tsx`
- FAQs:
  `app/admin/faqs/page.tsx`
- Testimonials:
  `app/admin/testimonials/page.tsx`

### Password handling

- Hashing and verification:
  `lib/password.ts`
- Customer/admin login API:
  `app/api/auth/login/route.ts`

### Upload behavior

- upload validation and file writing:
  `lib/uploads.ts`
- upload config:
  `lib/upload-config.ts`
- upload API:
  `app/api/uploads/route.ts`
- reusable upload UI:
  `components/uploaded-image-field.tsx`

### Catalog and performance

- storefront DB reads and caching:
  `lib/catalog.ts`

### Styling and interactions

- global styles and transitions:
  `app/globals.css`

## Common Tasks

### Change the company logo

1. Log in at `/admin-login`
2. Open `/admin/profile`
3. Upload the company logo in the avatar/logo field
4. Save profile

The navbar logo will read from that admin avatar path.

### Change customer-facing copy

- Homepage copy:
  `app/page.tsx`
- Footer copy:
  `components/store-footer.tsx`
- Site config values:
  `lib/site.ts`

### Change upload limits or file types

- `lib/upload-config.ts`
- `lib/uploads.ts`

### Add new database fields

1. Update `prisma/schema.prisma`
2. Create a migration
3. Run `npm run prisma:deploy`
4. Update the matching loaders/forms/routes

## Current Boundaries

- uploads are still stored locally, not yet in durable cloud storage
- some admin create/edit actions still need full persistence wiring
- Laravel remains in `laravel/` only as a behavioral reference while parity continues
