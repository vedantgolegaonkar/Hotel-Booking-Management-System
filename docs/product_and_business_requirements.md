# Product & Business Requirements Document (PRD & BRD)

---

## 1. Business Requirements Document (BRD)

### 1.1 Executive Summary
The client owns and operates a boutique resort in India with approximately 10–20 physical rooms. Currently, the resort relies heavily on manual bookings, phone reservations, and third-party Online Travel Agencies (OTAs) which charge steep commission rates (15% to 25%). 
This project aims to build a custom **Resort Management & Direct Booking Platform** comprising a premium, customer-facing marketing and booking website, and a unified internal management dashboard. The strategic goals are to maximize direct, commission-free bookings, streamline internal front-desk and housekeeping operations, and establish a modern, scalable digital presence.

### 1.2 Business Objectives & ROI Targets
- **Increase Direct Bookings:** Transition at least 40% of booking volume from OTAs to the direct platform within the first 12 months.
- **Reduce Commission Expenses:** Lower OTA commission payouts by 30% year-on-year.
- **Improve Operational Efficiency:** Automate room inventory management, payment collections, and check-in/out workflows to reduce guest front-desk wait times to under 3 minutes.
- **GST Compliance:** Eliminate manual billing errors by automating GST-compliant invoice generation based on the Indian Tax Slab rules.
- **Maximize Occupancy:** Enable dynamic pricing, last-minute coupons, and direct room category allocations.

### 1.3 Key Stakeholders & Value Proposition
- **Guests:** Premium, responsive user experience allowing search, date selection, category overview, and secure UPI/Card checkout.
- **Receptionists:** Simplified walk-in bookings, physical room assignment at check-in, real-time housekeeping statuses, and single-click checkout with automated invoice generation.
- **Resort Manager:** Live dashboard metrics (Occupancy, ADR, Revenue), seasonal tariff overrides, and coupon management.
- **Housekeeping Staff:** Operational checklist of dirty, cleaning, and ready rooms on mobile/tablet devices.
- **Super Admin:** Global configurations (GST details, Razorpay API credentials, user access control).

### 1.4 Indian Regulatory & GST Compliance (SAC 996311)
To comply with the Central Board of Indirect Taxes and Customs (CBIC) in India:
- **GST Slabs for Accommodation:** GST must be calculated dynamically based on the actual transaction value per room night:
  - **Tariff < ₹7,500 per night:** 12% GST (split as 6% CGST + 6% SGST, or 12% IGST for out-of-state guests).
  - **Tariff ≥ ₹7,500 per night:** 18% GST (split as 9% CGST + 9% SGST, or 18% IGST).
  - *Note:* If a discount coupon brings the room rate down, GST is calculated on the transaction price actually charged to the customer, not the original base rate.
- **Invoicing Requirements:** All generated invoices must display:
  - Resort's GSTIN (Goods and Services Tax Identification Number) and PAN.
  - SAC (Services Accounting Code) for lodging services: **996311**.
  - Guest's State Code and Place of Supply to determine CGST/SGST vs. IGST.
  - Breakout of Base Room Tariff, CGST, SGST, IGST, and Grand Total in INR.

---

## 2. Product Requirements Document (PRD)

### 2.1 Scope of the System
The system is divided into two primary sub-applications:
1. **Public Guest Portal:** A high-end, responsive Next.js web application showcasing resort highlights, room categories, real-time availability, and a frictionless booking checkout flow.
2. **Internal Management Dashboard:** A secure, role-based single-page application integrated into the same platform, enabling staff to handle front-desk, billing, inventory control, and housekeeping.

### 2.2 System Modules
```
+---------------------------------------------------------------------------------+
|                                 System Modules                                  |
+---------------------+---------------------+---------------------+---------------+
|  1. Public Website  | 2. Booking Engine   | 3. Front Desk Ops   | 4. Inventory  |
|  Showcase amenities,| Real-time inventory | Check-in, room      | Category rate |
|  gallery & rooms    | search & checkout   | assignment, checkout| logs, blocks  |
+---------------------+---------------------+---------------------+---------------+
|  5. GST Invoicing   | 6. Payments Hub     | 7. Housekeeping     | 8. Reporting  |
|  SAC 996311 logs,   | Razorpay webhooks,  | Live room status    | Occupancy, ADR|
|  CGST/SGST/IGST breakdown  | refunds & retries | tracking & checklists| RevPAR metrics|
+---------------------------------------------------------------------------------+
```

### 2.3 Functional Requirements

#### Module 1: Customer Portal & Rooms Showcase
- Show detailed pages for each Room Category (e.g., Deluxe, Premium, Suite, Family).
- Search availability based on Check-in Date, Check-out Date, and Number of Guests.
- Provide high-fidelity, fluid layouts featuring media galleries, descriptive copy, and lists of individual category amenities.

#### Module 2: Booking Engine & Checkout
- Implement a multi-step booking funnel (Search -> Select Category -> Guest Info -> Add-ons & Coupons -> Payment).
- Maintain transactional integrity: hold selected category inventory during the active payment session.
- Apply discount coupons matching business constraints (expiry dates, minimum booking value, limits).
- Render a clear, detailed bill detailing Base tariff, Discounts, GST breakdown (CGST/SGST/IGST), and Payable Amount.

#### Module 3: Payments & Gateway Integration
- Direct integration with Razorpay Checkout API.
- Support UPI, Net Banking, Credit/Debit cards, and Wallet options.
- Secure, async state resolution using Razorpay Webhooks (`payment.authorized`, `order.paid`, `payment.failed`).
- Automated, programmatic confirmation emails via Resend triggered upon webhook confirmation.

#### Module 4: Front Desk & Reception Management
- Interactive calendar dashboard showing arrivals, departures, and current stays.
- Walk-in booking flow allowing receptionist to input details, select category, capture payment, and instantly assign a physical room.
- Manual room number assignment screen at check-in, pulling from the pool of "Available" physical rooms within the booked category.
- Check-out flow triggering invoice generation, calculating any supplementary charges (e.g., extra bed, room service), and releasing the room.

#### Module 5: Housekeeping & Room Statuses
- Real-time room status board showing statuses: `Available`, `Reserved`, `Occupied`, `Cleaning Required`, `Maintenance`.
- Mobile-optimized interface for housekeeping staff to mark cleaning tasks as "In Progress" and then "Ready".
- Auto-transition: Checking out a guest must auto-update the assigned physical room status to `Cleaning Required`.

#### Module 6: Administration & Settings
- Admin dashboard to manage seasonal room rates, blackouts, and room categories.
- User management module for creating, updating, and revoking staff access (Receptionist, Manager, Housekeeper, Super Admin).
- Configurable settings: GSTIN, State code, default GST rates, refund policies, and contact details.

### 2.4 Non-Functional Requirements
- **Performance:** Customer-facing pages must achieve a Lighthouse Performance score of $\ge 90$ with dynamic Server-Side Rendering (SSR) and Edge caching.
- **Scalability:** The database schema must handle concurrent operations during peak holiday seasons. The monolithic backend architecture must use clean boundary separation to support easy extraction of the Booking Engine and Payment microservices in the future.
- **Reliability:** Availability search and transaction processing must prevent double-booking issues through strict database locks.
- **Security:** GDPR/PCI-DSS compliance practices: no storage of raw card information, HTTPS-only connections, JWT session timeouts, and encrypted database connections.
- **Accessibility:** UI compliance with WCAG 2.1 AA guidelines for fonts, contrast ratios, and screen readers.

---

## 3. MVP Scope Breakdown (Phase 1)
The initial MVP will focus strictly on establishing the core loop of booking, paying, assigning rooms, invoicing, and basic housekeeping:

| Module | Features Included in MVP | Out of Scope for MVP |
| :--- | :--- | :--- |
| **Resort Website** | Home, About, Gallery, Contact, Room listings, checkout screens. | 3D room walkthroughs, live chat widget. |
| **Booking Engine** | Category availability calculation, 10-minute session hold, coupon codes, automated Razorpay payments. | Multi-room bookings in a single checkout, guest profile dashboard. |
| **Front Desk** | Daily arrival/departure lists, room number assignment, walk-in bookings, manual check-in/out. | Interactive drag-and-drop room grid calendar. |
| **Inventory** | Static category capacities, manual room creation, floor assignments. | Automatic allocation rules, channel manager sync. |
| **GST Invoicing** | Base rates, GST calculations (12%/18% slabs), automated PDF invoice generation & email via Resend. | Custom accounting software sync (e.g., Tally, Zoho Books). |
| **Housekeeping** | Simple room list view with dropdown state updates (Dirty -> Cleaning -> Ready). | Housekeeper shift scheduling, cleaning checklists. |

---

## 4. Future Roadmaps

### 4.1 Phase 2: Channel Manager & Multi-Source Sync (6–12 Months)
- **Channel Manager Integration:** Bidirectional API sync with a channel manager (e.g., Staah, SiteMinder) to automatically update room category inventory and import bookings from major OTAs (MakeMyTrip, Booking.com, Agoda, Airbnb).
- **Interactive Room Grid:** A drag-and-drop timeline grid (Gantt-style) for receptionists to visualize physical room allocations and easily move bookings between rooms.
- **Guest Profiles & Loyalty:** A secure guest login portal containing booking history, preferences (e.g., bed type, dietary requirements), and automated loyalty points accumulation.
- **Add-on Services:** Pre-booking of airport transfers, guided tours, and wellness packages during checkout.

### 4.2 Phase 3: POS & Scale Operations (12–24 Months)
- **Point of Sale (POS) Module:** Integrated billing for the resort restaurant, spa, and souvenir shop. Guests can charge expenses directly to their room bills, which will automatically consolidate into the final invoice.
- **Advanced Pricing Engine:** Machine learning-driven dynamic pricing that adjusts tariffs based on historical occupancy, local weather forecasts, local festival calendars (e.g., Diwali, Christmas), and competitor rates.
- **Multi-Property Support:** Refactoring the database and backend to support a multi-resort group structure, sharing centralized guest databases, user permissions, and global analytics.
- **Smart Room Controls (IoT):** Integration with digital key cards and smart energy systems that activate/deactivate room AC and lights based on the room's live check-in and occupancy status.
