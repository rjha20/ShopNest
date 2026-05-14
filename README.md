# ShopNest

ShopNest is a full-stack multi-store ecommerce application built with Next.js App Router. It supports buyer shopping flows, seller store management, admin approvals, Razorpay payments, coupons, ratings, and AI-assisted product/store features.

## Features

- Buyer storefront with product browsing, product details, cart, checkout, order history, addresses, and ratings.
- Seller dashboard for store setup, product management, stock toggles, orders, and analytics.
- Admin dashboard for store approvals, store activation, coupons, and platform-level stats.
- Clerk authentication with user sync through Inngest.
- PostgreSQL data layer using Prisma ORM.
- ImageKit product image uploads and optimized product image URLs.
- Razorpay order creation and payment signature verification.
- Coupon support for public, new-user, and member-only discounts.
- ShopNest Plus membership checks through Clerk plan claims or metadata.
- AI utilities for product copy, image-based product descriptions, review summaries, and seller analytics.

## Tech Stack

- Next.js 15 App Router
- React 19
- Tailwind CSS 4
- Redux Toolkit and React Redux
- Prisma with PostgreSQL / Neon
- Clerk for authentication
- Inngest for background workflows
- ImageKit for product images
- Razorpay for payments
- Groq and Gemini for AI features
- Recharts, Axios, Lucide React, and React Hot Toast

## Project Structure

```text
ShopNest/
+-- app/
|   +-- (public)/              # Public storefront, cart, orders, product pages
|   +-- admin/                 # Admin dashboard and approval views
|   +-- api/                   # Next.js API route handlers
|   +-- store/                 # Seller dashboard pages
|   +-- StoreProvider.js       # Redux provider
|   +-- globals.css
|   +-- layout.jsx
+-- components/                # Shared buyer, seller, admin UI components
+-- configs/                   # Third-party service configuration
+-- inngest/                   # Inngest client and background functions
+-- lib/
|   +-- ai.js                  # Groq/Gemini AI helpers
|   +-- features/              # Redux slices
|   +-- plus.js                # Plus membership helpers
|   +-- prisma.js              # Prisma client
|   +-- store.js               # Redux store factory
+-- middleware/                # Seller/admin authorization helpers
+-- prisma/
|   +-- schema.prisma
+-- middleware.ts              # Clerk middleware
+-- package.json
+-- README.md
```

## Main Routes

### Public

- `/` - homepage
- `/shop` - all products
- `/shop/[username]` - individual seller storefront
- `/product/[productId]` - product details, reviews, and AI review summary
- `/cart` - cart and checkout
- `/orders` - buyer order history
- `/create-store` - seller store creation
- `/pricing` - membership/pricing page

### Seller

- `/store` - seller dashboard
- `/store/add-product` - add products
- `/store/manage-product` - manage products and stock
- `/store/orders` - seller order management

### Admin

- `/admin` - admin dashboard
- `/admin/stores` - store management
- `/admin/approve` - pending store approvals
- `/admin/coupons` - coupon management

## API Highlights

- `/api/products` - public product listing
- `/api/cart` - cart updates
- `/api/address` - buyer addresses
- `/api/orders` - order creation and buyer orders
- `/api/razorpay/verify` - Razorpay payment verification
- `/api/rating` - delivered-order product ratings
- `/api/coupon` and `/api/coupon/available` - coupon workflows
- `/api/store/*` - seller store, product, order, and dashboard APIs
- `/api/admin/*` - admin dashboard, stores, coupons, and approvals
- `/api/ai/product-description` - AI product listing generation
- `/api/ai/image-description` - AI listing generation from product image
- `/api/ai/review-summary` - AI review summary for buyers
- `/api/ai/store-analytics` - AI insights for sellers
- `/api/inngest` - Inngest function endpoint

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rha20/ShopNest.git
cd ShopNest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the variables needed for your setup.

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

ADMIN_EMAIL=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

NEXT_PUBLIC_CURRENCY_SYMBOL=Rs.

GROQ_API_KEY=
AI_MODEL=llama-3.1-70b-versatile
GEMINI_API_KEY=
GEMINI_VISION_MODEL=gemini-1.5-flash

NEXT_PUBLIC_CLERK_PLUS_PLAN_SLUGS=plus,plus_annual,shopnest_plus
```

Notes:

- `DATABASE_URL` and `DIRECT_URL` are used by Prisma for PostgreSQL.
- `ADMIN_EMAIL` supports comma-separated admin emails.
- AI features require `GROQ_API_KEY`; image-based AI features also require `GEMINI_API_KEY`.
- Razorpay checkout requires both server and public Razorpay keys.
- Plus membership can be detected through Clerk `has({ plan })`, session plan claims, or public user metadata.

### 4. Generate Prisma client and migrate the database

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev      # Start the Next.js dev server with Turbopack
npm run build    # Generate Prisma client and build for production
npm run start    # Start the production server
npm run lint     # Run Next.js linting
```

## Data Models

The Prisma schema includes:

- `User` - Clerk-linked buyer/seller account data and cart JSON
- `Store` - seller store profile, approval status, and activation state
- `Product` - product catalog with images, pricing, category, and stock
- `Order` and `OrderItem` - multi-store order records and payment state
- `Address` - buyer shipping details
- `Rating` - product rating and review tied to a delivered order
- `Coupon` - discount configuration and expiration

## Background Jobs

Inngest functions handle:

- Creating users when Clerk emits `user.created`
- Updating user records when Clerk emits `user.updated`
- Deleting users when Clerk emits `user.deleted`
- Removing coupons after their expiration time

## Roadmap

- Complete Razorpay checkout support.
- Add richer real-time order tracking.
- Expand seller analytics and reporting.
- Add more membership-specific buyer benefits.
- Improve automated tests for API workflows.

## Author

Rohan Jha  
GitHub: https://github.com/rha20

## License

This project is licensed under the MIT License.
