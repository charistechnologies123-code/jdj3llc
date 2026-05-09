# JDJ3 Next App Feature Parity Checklist

This checklist tracks the Laravel-to-Next route and feature reproduction work.

## Current rule

- Laravel remains in the workspace as reference only
- All new implementation work happens in the root Next.js app
- The root app is the primary build target

## Route parity

### Storefront

- [x] `/`
- [x] `/shop`
- [x] `/products/[slug]`
- [ ] `POST /products/[slug]/reviews`
- [x] `/cart`
- [x] `/checkout/access`
- [x] `/checkout`
- [x] `/about`
- [x] `/faqs`
- [x] `/testimonials`

### Customer auth and account

- [x] `/register`
- [x] `/login`
- [x] `/forgot-password`
- [x] `/reset-password/[token]`
- [x] `/profile`
- [ ] persisted address create/update/delete in database
- [ ] persisted password update in database
- [ ] logout wired to persistent auth session

### Admin auth and portal

- [x] `/admin-login`
- [x] `/admin`
- [x] `/admin/products`
- [x] `/admin/products/create`
- [x] `/admin/products/[id]/edit`
- [x] `/admin/orders`
- [x] `/admin/orders/[id]`
- [x] `/admin/profile`
- [x] `/admin/users`
- [x] `/admin/reviews`
- [x] `/admin/coupons`
- [x] `/admin/testimonials`
- [x] `/admin/faqs`

## Feature parity

### Data layer

- [ ] Prisma migration successfully applied to Supabase
- [ ] categories persisted in Supabase
- [ ] products persisted in Supabase
- [ ] product images persisted in durable storage
- [ ] orders persisted in Supabase
- [ ] reviews persisted in Supabase
- [ ] coupons persisted in Supabase
- [ ] addresses persisted in Supabase
- [ ] referrals persisted in Supabase

### Auth

- [ ] replace local demo auth with real persisted auth
- [ ] admin-only access enforced from persisted user role
- [ ] customer profile data loaded from database
- [ ] password reset flow implemented

### Commerce flow

- [x] usable cart UX exists
- [ ] guest cart validated against live stock
- [ ] checkout writes order transaction to Supabase
- [ ] stock decrement transaction implemented
- [ ] coupon validation matches Laravel rules
- [ ] referral conversion logic matches Laravel rules
- [ ] order confirmation UX matches Laravel outcome

### Admin operations

- [ ] product create/edit/delete mutations
- [ ] review status update mutations
- [ ] coupon create/update mutations
- [ ] order detail view with items and metadata
- [ ] user delete behavior

### Messaging

- [ ] admin order notification email
- [ ] customer order confirmation email
- [ ] WhatsApp links preserved across storefront flows

## Immediate priority

1. Fix Supabase authentication and apply Prisma migration
2. Replace local auth with real persistence
3. Persist checkout and order creation
4. Finish missing admin CRUD routes
