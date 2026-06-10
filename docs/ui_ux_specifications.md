# Screen-by-Screen UI/UX & Wireframe Specifications

---

## 1. Design System & Premium Aesthetics

To deliver a premium, high-converting digital experience, the platform will utilize a custom design system based on a modern dark-mode-first dashboard and a warm, elegant customer portal matching the luxury resort vibe.

### 1.1 Color Palette
- **Primary (Luxury Gold):** `#C5A880` (HSL `36, 38%, 64%`) – Used for accents, buttons, and headings.
- **Secondary (Deep Forest/Ocean):** `#1A2F2C` (HSL `170, 28%, 15%`) – Reflects nature/luxury resort surroundings.
- **Background (Light/Guest Portal):** `#FAF8F5` (Warm Cream) – Enhances readability and luxury feel.
- **Background (Dark/Dashboard):** `#0F1413` (Sleek Onyx) – High-fidelity professional dashboard theme.
- **Text (Primary):** `#1E2221` (On Light) / `#F5F6F6` (On Dark).

### 1.2 Typography
- **Headings:** *Playfair Display* (Serif font family) – Evokes timelessness, heritage, and premium hospitality.
- **Body Text:** *Inter* or *Outfit* (Sans-serif) – Ensuring high legibility across mobile and desktop.

### 1.3 Micro-Animations & Interactivity
- **Hover Transitions:** All interactive elements (buttons, cards, inputs) must transition with `cubic-bezier(0.16, 1, 0.3, 1)` over `300ms`.
- **Framer Motion Presets:**
  - **Fade-in-up:** `initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}`
  - **Scale-hover:** `whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}`

---

## 2. Screen Inventory

### 2.1 Guest-Facing Web Portal
1. **Home Page (`/`):** Hero, Search Widget, Highlights, Amenities, Testimonials, Gallery Preview.
2. **About Us (`/about`):** History, Philosophy, Virtual Tour, Team.
3. **Rooms Listing (`/rooms`):** Category cards, prices, quick filters.
4. **Room Detail Page (`/rooms/[category_id]`):** Dedicated media slider, descriptive specifications, bed layout, availability check, reviews.
5. **Booking Flow Checkout (`/book`):** Multi-step wizard (Guest Details, Coupon, Billing, Payment).
6. **Booking Confirmation (`/book/confirmation?id=XYZ`):** Interactive confirmation card, print-invoice button, itinerary roadmap.
7. **Gallery (`/gallery`):** Category filtered masonry layout (Rooms, Dining, Wellness, Activities) with video lightbox.
8. **Contact Page (`/contact`):** Interactive contact form, Map integration, WhatsApp float button.

### 2.2 Internal Staff Dashboard
1. **Login Page (`/dashboard/login`):** Credentials, MFA token field.
2. **Reception Home / Daily Sheet (`/dashboard/reception`):** Grid showing Check-ins, Check-outs, In-house Guests.
3. **Walk-In Booking Wizard (`/dashboard/walk-in`):** Interactive room calendar selector and booking form.
4. **Reservations Ledger (`/dashboard/bookings`):** Table list with filters, details drawers, room assign panels.
5. **Housekeeping Console (`/dashboard/housekeeping`):** Mobile-optimized grid of rooms, color-coded statuses, quick action buttons.
6. **Manager Reports (`/dashboard/reports`):** Charts for Occupancy, ADR, RevPAR, Revenue splits.
7. **Pricing Configurator (`/dashboard/pricing`):** Seasonal rate sheets, weekend markups, custom event rule calendar.
8. **Coupon Manager (`/dashboard/coupons`):** CRUD table for percentage/flat coupon controls.
9. **Super Admin Global Settings (`/dashboard/settings`):** GST percentage configuration, GSTIN details, Razorpay webhook keys, role allocations.

---

## 3. Screen-by-Screen UI/UX Specifications

### 3.1 Customer Home Page (`/`)
- **UX Goal:** Hook the user visually, establish trust, and immediately facilitate search.
- **Hero Section:**
  - Full-screen high-res background video of the resort.
  - Overlay: Glassmorphic heading ("A Sanctuary for the Soul") and a subtle scroll-indicator animation.
  - Parallax effect: The hero background moves at a slower rate than the foreground scroll (`0.5` scroll speed ratio).
- **Search Availability Widget:**
  - Placed horizontally at the bottom of the hero (sticky on scroll for desktop, fixed sticky bottom bar for mobile).
  - Inputs: Check-in Date (DatePicker), Check-out Date (DatePicker), Guests Count (Incrementer modal).
  - Button: "Check Availability" (Luxury Gold, expanding hover glow animation).

#### Wireframe Concept: Guest Homepage
```
+-----------------------------------------------------------------------+
|  [Logo]                       [Rooms]   [Gallery]   [Book Now Button] |
+-----------------------------------------------------------------------+
|                                                                       |
|                     A Sanctuary for the Soul                          |
|                 [ Discover our Premium Suites ]                       |
|                                                                       |
|     +-----------------------------------------------------------+     |
|     |  Check-In   |  Check-Out  |  2 Guests  |  [ Search Now ]  |     |
|     +-----------------------------------------------------------+     |
+-----------------------------------------------------------------------+
|                                                                       |
|  [ Resort Highlights Section ]                                        |
|  Three columns: Premium Spa (Icon), Private Pool (Icon), Dine (Icon)   |
|                                                                       |
+-----------------------------------------------------------------------+
```

### 3.2 Rooms Listing (`/rooms`)
- **Grid Layout:** 2-column grid on desktop, single-column stack on mobile.
- **Card Design:**
  - Image carousel (touch swipe-enabled on mobile).
  - Info overlay: Category Name, Base Tariff (e.g., "From ₹8,500 / night + GST"), Capacity ("Max 3 Adults").
  - Hover state: Image zooms slightly (`scale: 1.05`), and a secondary button slides up: "Explore Details".

### 3.3 Booking Flow Checkout (`/book`)
- **Wizard Structure:** Clean progress bar at the top (`Details` -> `Review & Coupons` -> `Secure Payment`).
- **Step 1: Guest Information:**
  - Fields: First Name, Last Name, Email, Phone, Place of Supply (Dropdown of Indian States for GST), and Optional Corporate GSTIN.
- **Step 2: Review & Coupon:**
  - Visual summary of the booked room category and selected dates.
  - Coupon Input: Typing a coupon code activates a loading state, followed by a checkmark and discount text.
  - Ledger breakdown:
    - Base Room Tariff: ₹25,500.00
    - Coupon Discount (`ANNIVERSARY10`): -₹2,550.00
    - Net Taxable Value: ₹22,950.00
    - CGST (9%): ₹2,065.50
    - SGST (9%): ₹2,065.50
    - **Total Payable Amount:** **₹27,081.00**
- **Step 3: Secure Payment:**
  - Clean container containing Razorpay's iframe. The background is dimmed (backdrop blur) to keep focus on the payment gateway.

---

## 4. Internal Dashboard Wireframe Specifications

### 4.1 Receptionist Booking & Daily Sheet (`/dashboard/reception`)
- **Visual Grid:** The page is split into three main segments for quick daily triage.
- **Header Status Cards:** 
  - "Today's Arrivals" (Green badge, count).
  - "In-House" (Blue badge, count).
  - "Departing Today" (Amber badge, count).
- **Search Bar:** Centered at the top. Supports filtering by Guest Name, Booking ID, or Room Number.
- **Assign Room Modal:** Clicking "Assign Room" on a guest record opens a modal showing a grid of available physical rooms color-coded by floor.

#### Wireframe Concept: Reception Daily Sheet
```
+-----------------------------------------------------------------------+
|  [Menu]  Dashboard  >  Reception                               [User] |
+-----------------------------------------------------------------------+
|  +---------------+   +---------------+   +---------------+            |
|  | Arrivals: 8   |   | In-House: 14  |   | Departure: 5  |            |
|  +---------------+   +---------------+   +---------------+            |
|                                                                       |
|  [ Search Booking... ]                              [+ Walk-in Booking]|
|  +-----------------------------------------------------------------+  |
|  | Guest Name   | Category | Dates       | Status    | Action      |  |
|  +--------------+----------+-------------+-----------+-------------+  |
|  | Aarav Mehta  | Suite    | 12-15 Oct   | Confirmed | [Assign Rm] |  |
|  | Joy D'Souza  | Deluxe   | 08-11 Oct   | In-House  | [Check-Out] |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

### 4.2 Housekeeping Console (`/dashboard/housekeeping`)
- **Layout:** Mobile-first, card-based interface with large tap-targets.
- **Cards Color Coding:**
  - `Available` = Emerald green border.
  - `Occupied` = Ocean blue border.
  - `Cleaning Required` = Crimson red pulse background.
  - `Cleaning In Progress` = Amber yellow border.
  - `Maintenance` = Slate grey border.
- **Quick Action Button:** On a room card flagged as `Cleaning Required`, a large button: **"Start Cleaning"** transitions the state instantly. Upon completion, a large **"Mark Ready"** button is revealed.

### 4.3 Manager Analytics Dashboard (`/dashboard/reports`)
- **Key Performance Indicators (KPIs):**
  - **Occupancy Rate:** Radial progress gauge ($\text{Occupied Rooms} / \text{Total Rooms} \times 100$).
  - **ADR (Average Daily Rate):** Total Room Revenue / Booked Rooms (Formatted in ₹).
  - **RevPAR (Revenue Per Available Room):** Total Room Revenue / Total Available Rooms.
- **Interactive Charts:**
  - **Monthly Revenue Chart:** Area chart (using Recharts or Chart.js) showing revenue over time.
  - **Category Performance Chart:** Horizontal bar chart demonstrating occupancy distribution across Deluxe, Premium, and Suite rooms.
