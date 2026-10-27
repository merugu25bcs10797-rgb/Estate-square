# EstateSquare - 4-Minute Product Demo Script

This script walks through the complete end-to-end user journey across all three roles (**Seller**, **Admin**, **Buyer**), demonstrating moderation, visit conflict prevention, enquiries, and favorites.

---

### Setup (Before Starting Demo)
- Backend running on `http://localhost:8084`
- Frontend running on `http://localhost:5173`
- Pre-seeded with admin, seller, buyer, and approved properties (`npm run seed`)

---

### Minute 0:00 – 0:45 | Overview & Seller Listing Creation
1. **Introduction**:
   - Open `http://localhost:5173/`. Point out the clean, trustworthy UI, warm-neutral background, and emerald green accent.
   - Mention the core problem: Indian real estate spam, duplicate unverified listings, and chaotic visit scheduling.
2. **Register as Seller**:
   - Click **Get Started** or **Register**.
   - Select **Property Owner (Seller)** role.
   - Register as:
     - Name: `Anil Sharma`
     - Email: `anil.seller@example.com`
     - Password: `Password123!`
   - Show automatic redirect to **Seller Dashboard**.
3. **Submit a New Listing**:
   - Click **Post New Property**.
   - Enter:
     - Title: `Grand 3 BHK Sky Villa in Indiranagar`
     - Price: `17500000` (₹1.75 Cr)
     - City: `Bangalore`
     - Address: `12th Main Road, HAL 2nd Stage, Indiranagar`
     - Bedrooms: `3`, Bathrooms: `3`, Area: `2200 sqft`
     - Description: `High-floor luxury 3 BHK apartment with panoramic skyline views, private lift, and 2 covered car parking slots.`
   - Click **Submit for Moderation**.
   - Show that the property appears on the dashboard with a **Pending Review** badge and is **NOT** visible on the public search page yet.

---

### Minute 0:45 – 1:30 | Admin Moderation Workflow
1. **Sign in as Admin**:
   - Log out. Click **Sign in**.
   - Enter Admin credentials (`admin@estatesquare.com` or `admin@propertyhub.com` / `AdminPassword123!`).
   - Click **Sign In**.
2. **Review Pending Queue**:
   - Navigate to **Admin Moderation** (`/admin/moderation`).
   - Show the newly posted listing in the moderation queue.
   - Point out the **Preview**, **Reject** (with reason modal), and **Approve Listing** buttons.
3. **Approve Listing**:
   - Click **Approve Listing**.
   - Show the success toast notification and demonstrate that the listing disappears from the pending queue.

---

### Minute 1:30 – 2:45 | Buyer Search, Favorite, Enquiry & Visit Scheduling
1. **Onboard as Buyer (Core Flow)**:
   - Log out. Click **Get Started** or **Register**.
   - Select **Home Buyer** role.
   - Register as:
     - Name: `Priya Patel`
     - Email: `priya.buyer@example.com`
     - Password: `Password123!`
   - Show automatic redirect to verified public exploration (`/search`).
2. **Search & Discovery**:
   - Navigate to **Explore All** (`/search`).
   - Show that `Grand 3 BHK Sky Villa in Indiranagar` is now publicly visible with verified badges!
   - Demonstrate the server-side filters (filter by City: *Bangalore*, BHK: *3+*, ListingType: *Buy*). Notice URL updating in real time.
3. **Save to Favorites**:
   - Click on the listing card to open the **Property Details** page.
   - Click **Save Property**. Point out the filled heart icon and confirmation toast.
4. **Send Direct Enquiry**:
   - Click **Send Enquiry**.
   - Enter message: `"Is the pricing negotiable for immediate token payment?"`
   - Click **Send Enquiry** inside modal.
5. **Schedule a Visit**:
   - Click **Schedule a Visit**.
   - Pick a future date (e.g. 3 days ahead) and select `10:00 AM - 11:00 AM` slot.
   - Add note: `"Visiting with family"`.
   - Click **Submit Visit Request**.

---

### Minute 2:45 – 3:30 | Buyer Dashboard Verification
1. **Navigate to Buyer Dashboard** (`/dashboard/buyer`):
   - **My Visits Tab**: Show the newly scheduled visit with status `pending` and time formatted in Indian Standard Time (IST).
   - **My Enquiries Tab**: Show the enquiry sent to Anil Sharma with status `pending`.
   - **Saved Favorites Tab**: Show the saved Indiranagar listing with 4:3 card aspect ratio.

---

### Minute 3:30 – 4:00 | Seller Confirmation & Conflict Prevention
1. **Sign in as Seller**:
   - Log out. Sign in as `anil.seller@example.com` / `Password123!`.
   - Go to **Seller Dashboard** (`/dashboard/seller`).
2. **Review Received Enquiries**:
   - Switch to **Buyer Enquiries** tab.
   - View Priya Patel's enquiry and click **Accept**.
3. **Review & Confirm Received Visit**:
   - Switch to **Received Visits** tab.
   - View the visit requested for `10:00 AM IST`.
   - Click **Confirm**.
   - Watch the status badge transition to **Confirmed**.
   - Mention the double-booking engine: Any second request on this property within 1 hour is automatically blocked with HTTP 409 Conflict.
4. **Conclusion**:
   - Summarize the 5 enforced workflows completed: Auth & Roles, Listing Lifecycle & Moderation, Search & Discovery, Visit State Machine with Conflict Prevention, and Direct Enquiries/Favorites.
