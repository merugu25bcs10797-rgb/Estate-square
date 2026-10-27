# PropertyHub - Curated Real Estate Marketplace

> Verified Indian property platform eliminating duplicate spam, fake listings, and disorganized visit scheduling through mandatory admin moderation and a strict 1-hour slot state machine.

---

## Live Links (Deployment Target Placeholders)
- **Frontend App**: `TODO: Add Vercel live URL (e.g. https://propertyhub.vercel.app)`
- **Backend API**: `TODO: Add Render live URL (e.g. https://propertyhub-api.onrender.com)`
- **API Health Check**: `TODO: Add Render health URL (e.g. https://propertyhub-api.onrender.com/health)`

---

## Problem Statement
The Indian real estate market is notoriously plagued by:
1. **Fake & Duplicate Listings**: Unverified brokers spam portals with duplicate properties and expired listings.
2. **Broken Communication & Double-Booking**: Property owners lose track of buyer enquiries, and open-ended visit scheduling causes chaotic double-bookings.
3. **Lack of Accountability**: Unchecked listings lead to wasted visits and diminished trust for genuine buyers and tenants.

## Solution & Target Users
PropertyHub introduces a moderated marketplace model:
- **Buyers & Renters**: Search verified residential and commercial properties with server-side filters, schedule conflict-free visits, send direct enquiries, and save favorites.
- **Property Owners / Sellers**: Submit property listings with photo uploads, view admin rejection notes, manage visit requests via a formal state machine, and track buyer enquiries.
- **Admin Moderators**: Review all newly submitted and updated listings before granting public visibility.

---

## Key Features

1. **Role-Based Authentication & Session Security**:
   - Roles: `buyer`, `seller`, `admin`.
   - Public registration strictly permits `buyer` or `seller` (admin role is blocked with HTTP 400).
   - Admin account provisioned via idempotent seed script (`npm run seed`) using environment variables.
   - Session stored in an **HttpOnly, Secure cookie** (`sameSite: "none"` in production cross-site environments).
   - Rate limiting on `/api/auth/*` endpoints.

2. **Listing Lifecycle with Mandatory Admin Moderation**:
   - Seller creates listing -> status `pending` (owner automatically assigned from session, never request body).
   - Admin approves or rejects with a mandatory reason.
   - If rejected, seller views the reason, edits the listing, and resubmits (reverting to `pending`).
   - Editing an approved listing's key fields automatically reverts status back to `pending`.
   - Only `approved` listings appear publicly.
   - Safe deletion removes associated Cloudinary assets via API.

3. **Server-Side Search & Discovery**:
   - Query filters: `city`, `listingType` (`sale` | `rent`), `propertyType`, `minPrice`, `maxPrice`, `bedrooms`, `sort`, `page`, `limit`.
   - Validated server-side using Zod schemas; invalid query parameters return HTTP 400.
   - URL-synced search state (`useSearchParams`) for shareable links.
   - Mongoose compound indexes for performant query execution.
   - Responsive loading skeletons, empty state, and clear-filters button.

4. **Visit Requests with Strict State Machine**:
   - Buyer schedules a future date/time slot (past dates rejected with HTTP 400).
   - State machine enforces valid transitions:
     - `pending -> confirmed | rejected | cancelled`
     - `confirmed -> cancelled | completed`
     - All invalid transitions return **HTTP 409 Conflict**.
   - **Double-Booking Prevention**: Before a seller confirms a visit for a property, the system checks for any confirmed visit within 1 hour (`|visitDate - slot| < 60 mins`). If found, returns **HTTP 409 Conflict**.
   - Dates stored in UTC and displayed in Indian Standard Time (IST).

5. **Direct Enquiries & Idempotent Favorites**:
   - Direct enquiries on approved listings with status progression (`pending -> accepted | rejected -> closed`).
   - Favorites backed by unique compound index `(user, property)` for idempotent toggling.
   - Strict privacy: Buyers and sellers can only see their own records (HTTP 403 / 404 otherwise).

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React Icons |
| **Backend** | Node.js (ESM), Express 4, Mongoose 8, Zod, bcryptjs, jsonwebtoken, cookie-parser, cors, helmet, express-rate-limit, Multer (memory) |
| **Storage & Media** | MongoDB Atlas, Cloudinary SDK |
| **Testing** | Jest 29, Supertest 7, mongodb-memory-server 10 |
| **Deployment Targets** | Vercel (Frontend SPA), Render (Backend Web Service) |

---

## Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|               React 18 + Vite (SPA) Hosted on Vercel                            |
|    - Tailwind CSS (Warm-neutral palette, Emerald accent, 4:3 cards)             |
|    - Axios instance (baseURL fallback, withCredentials: true, 401 interceptor)   |
+---------------------------------------------------------------------------------+
                                      |
                      HTTPS / JSON / HttpOnly Cookie
                                      |
+---------------------------------------------------------------------------------+
|                                 SERVER TIER                                     |
|                   Express.js (ESM) Hosted on Render                             |
|    - Security: helmet, rateLimit, cors (explicit origin, credentials: true)    |
|    - Middleware: protect (JWT cookie), restrictTo (roles), validate (Zod)       |
|    - Routes: /api/auth, /api/properties, /api/visits, /api/enquiries,           |
|              /api/favorites, /api/admin, /health                                |
+---------------------------------------------------------------------------------+
                         /                             \
                        /                               \
+------------------------------------+    +---------------------------------------+
|            DATA TIER               |    |              MEDIA TIER               |
|      MongoDB Atlas / MMS           |    |            Cloudinary SDK             |
|  - Users, Properties, Visits,      |    |  - Max 5 images, 5MB limit            |
|    Enquiries, Favorites            |    |  - Safe asset removal on delete       |
|  - Compound unique indexes         |    |                                       |
+------------------------------------+    +---------------------------------------+
```

---

## Data Models & Relations

1. **User**: `_id`, `name`, `email` (unique), `passwordHash` (hidden), `role` (`buyer` | `seller` | `admin`), `phone`, `timestamps`.
2. **Property**: `_id`, `title`, `description`, `price`, `city`, `address`, `bedrooms`, `bathrooms`, `propertyType`, `listingType`, `areaSqFt`, `images` (`[{ url, public_id }]`), `status` (`pending` | `approved` | `rejected`), `rejectionReason`, `owner` (ref `User`), `timestamps`.
   - *Indexes*: `{ status: 1, city: 1, listingType: 1, price: 1 }`, `{ owner: 1, createdAt: -1 }`.
3. **Visit**: `_id`, `property` (ref `Property`), `buyer` (ref `User`), `seller` (ref `User`), `visitDate` (Date, UTC), `status` (`pending` | `confirmed` | `rejected` | `cancelled` | `completed`), `note`, `sellerNote`, `timestamps`.
   - *Indexes*: `{ property: 1, visitDate: 1, status: 1 }`, `{ seller: 1, createdAt: -1 }`, `{ buyer: 1, createdAt: -1 }`.
4. **Enquiry**: `_id`, `property` (ref `Property`), `buyer` (ref `User`), `seller` (ref `User`), `name`, `email`, `phone`, `message`, `status` (`pending` | `accepted` | `rejected` | `closed`), `timestamps`.
5. **Favorite**: `_id`, `user` (ref `User`), `property` (ref `Property`), `timestamps`.
   - *Compound Unique Index*: `{ user: 1, property: 1 }`.

---

## API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | System health check and uptime |
| `POST` | `/api/auth/register` | Public (Buyer/Seller only) | Register account (rate limited) |
| `POST` | `/api/auth/login` | Public | Authenticate and issue HttpOnly JWT |
| `POST` | `/api/auth/logout` | Public | Clear session cookie |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user session |
| `GET` | `/api/properties` | Public | Server-side filtered search for approved listings |
| `GET` | `/api/properties/:id` | Public / Owner / Admin | Retrieve property specifications |
| `GET` | `/api/properties/my` | Seller | Retrieve seller's own listings |
| `POST` | `/api/properties` | Seller | Post property listing (defaults to pending) |
| `PUT` | `/api/properties/:id` | Seller (Owner only) | Update listing (resets to pending) |
| `DELETE` | `/api/properties/:id` | Seller / Admin | Delete property and Cloudinary assets |
| `GET` | `/api/admin/properties/pending` | Admin | Retrieve pending moderation queue |
| `PATCH` | `/api/admin/properties/:id/approve` | Admin | Approve pending listing |
| `PATCH` | `/api/admin/properties/:id/reject` | Admin | Reject listing with required reason |
| `POST` | `/api/properties/:id/visits` | Buyer | Schedule visit (future UTC date) |
| `GET` | `/api/visits/my` | Buyer | Retrieve buyer's scheduled visits |
| `GET` | `/api/visits/received` | Seller | Retrieve visits for seller's properties |
| `PATCH` | `/api/visits/:id/status` | Buyer / Seller | State transition with 1-hr conflict check |
| `POST` | `/api/properties/:id/enquiries` | Buyer | Send direct enquiry |
| `GET` | `/api/enquiries/my` | Buyer | Retrieve buyer's sent enquiries |
| `GET` | `/api/enquiries/received` | Seller | Retrieve enquiries for seller's properties |
| `PATCH` | `/api/enquiries/:id/status` | Seller | Update enquiry status |
| `POST` | `/api/properties/:id/favorite` | Authenticated | Toggle saved favorite status |
| `GET` | `/api/favorites` | Authenticated | Retrieve user's saved properties |

---

## Local Setup & Development

### 1. Prerequisites
- Node.js >= 18 (Tested on Node v25.2.1)
- npm >= 9

### 2. Installation
Clone the repository and install dependencies:
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 3. Environment Configuration
Create `backend/.env` based on `backend/.env.example`:
```env
PORT=8084
dbURL=memory
JWT_SECRET=super_secret_jwt_key_at_least_32_chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=admin@propertyhub.com
ADMIN_PASSWORD=AdminPassword123!
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8084
```

### 4. Seed the Database
Populate the admin user and 13 sample Indian property listings:
```bash
npm --prefix backend run seed
```

### 5. Start Development Servers
```bash
# Terminal 1: Backend (runs on http://localhost:8084)
npm --prefix backend run dev

# Terminal 2: Frontend (runs on http://localhost:5173)
npm --prefix frontend run dev
```

---

## Test Execution Results
Real automated integration tests run with Jest, Supertest, and mongodb-memory-server:

```
PASS tests/property.test.js
  ✓ Test 3: unauthenticated create listing -> 401
  ✓ Test 4: seller cannot edit another seller's listing -> 403
  ✓ Test 5: pending listings are absent from public search; approved ones appear
  ✓ Test 6: search filters, sort, and pagination work; invalid query params -> 400

PASS tests/visit.test.js
  ✓ Test 8: visit: past date rejected, invalid transition -> 409, double-booking -> 409

PASS tests/enquiry.test.js
  ✓ Test 9: buyer cannot read another buyer's enquiries/visits

PASS tests/favorite.test.js
  ✓ Test 7: favorites: no duplicates, idempotent remove

PASS tests/auth.test.js
  ✓ Test 1: public register can't create admin (400) and register duplicate email -> 409
  ✓ Test 2: wrong password fails safely with 401

PASS tests/health.test.js
  ✓ Test 10: /health returns ok with 200 status

Test Suites: 6 passed, 6 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        6.384 s
Ran all test suites.
```

To run tests:
```bash
npm --prefix backend run test
```

---

## Deployment Guide (Vercel & Render)

### Step 1: MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster.
2. In **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so Render instances can connect.
3. In **Database Access**, create a user with read/write privileges.
4. Copy the connection string (format: `mongodb+srv://<user>:<password>@cluster.mongodb.net/propertyhub?retryWrites=true&w=majority`).

### Step 2: Render Backend Deployment
1. Create a new **Web Service** on Render connected to this repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `PORT`: `8084`
   - `NODE_ENV`: `production`
   - `dbURL`: Your MongoDB Atlas URI
   - `JWT_SECRET`: Secure random string (min 32 characters)
   - `CLIENT_URL`: `https://<your-vercel-app>.vercel.app` (or temporary placeholder until frontend is deployed)
   - `ADMIN_EMAIL`: Admin email address
   - `ADMIN_PASSWORD`: Strong admin password
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret
4. Deploy the service. Verify deployment at `https://<your-render-app>.onrender.com/health`.

### Step 3: Vercel Frontend Deployment
1. Import repository into Vercel.
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-render-app>.onrender.com`
4. Deploy. The `frontend/vercel.json` SPA rewrite ensures client-side routing works for all URLs.

### Step 4: Cross-Site Cookie Sync
1. In Render dashboard, ensure `CLIENT_URL` is set to the exact Vercel production domain (e.g. `https://propertyhub.vercel.app`).
2. Trigger a redeploy on Render.
3. **Cross-Site Cookie Configuration Note**: In production (`NODE_ENV === 'production'`), PropertyHub configures cookies with `sameSite: "none"` and `secure: true`. This allows cross-site authentication cookies between Vercel and Render while blocking unauthorized origins via explicit CORS headers.

---

## Known Limitations
- Render Free Tier instances spin down after inactivity, causing a 30–50s delay on the initial request. A friendly "Server waking up" indicator is built into the UI to guide users.
- Live video tour streaming is not integrated; scheduling is currently designed for physical visits.

---

## AI Usage Disclosure
This codebase was designed and pair-programmed with Google DeepMind Antigravity agentic coding assistant to accelerate scaffolding, state machine implementation, Zod validations, Jest test suites, and end-to-end browser verification.
