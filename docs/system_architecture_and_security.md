# System Architecture, Folder Structure, & Security Specifications

---

## 1. System Architecture

The Resort Management & Direct Booking Platform is structured as a **Modular Monolith** to keep development and deployment simple in the initial phase while ensuring clean boundaries between domain models so they are ready to transition into separate microservices if needed.

### 1.1 Technical Stack Overview
```
+---------------------------------------------------------------------------------+
|                               Technical Stack                                   |
+---------------------+---------------------+---------------------+---------------+
|  Frontend (NextJS)  |  Backend (Spring)   | Database (Postgres) | Media/Storage |
|  App Router, TS,    |  Spring Boot 3.x,   | Supabase Managed    | Supabase      |
|  Tailwind CSS       |  Security, JPA      | PostgreSQL v15      | Storage       |
+---------------------+---------------------+---------------------+---------------+
|  Payments Gateway   |  Email Services     | Auth System         | CI/CD & Host  |
|  Razorpay Checkout  |  Resend API         | Spring Security JWT | Vercel (FE)   |
|  API Integrations   |  SMTP Client        | and Refresh Tokens  | Railway/AWS   |
+---------------------------------------------------------------------------------+
```

### 1.2 Frontend Architecture (Next.js)
- **App Router & Server-Side Rendering (SSR):** Customer-facing routes (e.g., `/`, `/rooms`, `/about`) are rendered on the server (React Server Components - RSC) to maximize SEO, enable page speed, and pre-render dynamic room pricing.
- **Client Components (`"use client"`):** Used selectively for high-fidelity interactive elements, such as the booking calendar widgets, image gallery filters, Razorpay modal overlays, and dashboard charts.
- **State Management:**
  - **Global Dashboard UI State:** React Context API (e.g., Sidebar toggle, active receptionist notifications).
  - **Booking Checkout Session State:** Local state managed with a custom hook wrapping `sessionStorage` to retain guest details across the 3-step funnel.
  - **Server Data Caching:** SWR or TanStack Query (React Query) for fetching live data inside the internal dashboard, enabling automatic background refetches of housekeeping and arrival status.

### 1.3 Backend Architecture (Spring Boot)
- **Modular Monolith Layout:** The application is split into domain-specific packages. Packages communicate via defined interfaces (Services) or local Application Events (e.g., `PaymentConfirmedEvent`), avoiding tight coupling between database entities.
- **Data Access Layer:** JPA/Hibernate with connection pooling via HikariCP. Optimistic locking `@Version` is applied to daily inventory tracking to prevent race conditions during booking updates.
- **Async Execution:** Asynchronous operations (email dispatch via Resend, system audit logs, payment timeout schedulers) run in a managed thread pool via Spring's `@EnableAsync` and `@Scheduled`.

---

## 2. Directory Folder Structures

### 2.1 Next.js Frontend Folder Structure
```
resort-frontend/
├── public/                 # Static assets (logos, icons)
├── src/
│   ├── app/                # App Router hierarchy
│   │   ├── (auth)/         # Group for login and authentication
│   │   │   └── login/page.tsx
│   │   ├── (guest)/        # Group for public pages
│   │   │   ├── page.tsx    # Homepage
│   │   │   ├── rooms/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [categoryId]/page.tsx
│   │   │   └── book/
│   │   │       ├── page.tsx
│   │   │       └── confirmation/page.tsx
│   │   ├── (dashboard)/    # Group for internal hotel management dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── reception/page.tsx
│   │   │   ├── housekeeping/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── layout.tsx      # Main wrapper layout
│   │   └── globals.css     # Tailwind configuration & global styles
│   ├── components/         # Shared components
│   │   ├── ui/             # Atomic design components (buttons, dialogs)
│   │   ├── visual/         # Premium interactive components (3D elements, parallax cards)
│   │   ├── booking/        # Components specific to booking checkout funnel
│   │   └── dashboard/      # Sidebar, headers, and data tables
│   ├── hooks/              # Custom React hooks (useBooking, useAuth)
│   ├── services/           # API integration clients (axios config)
│   ├── types/              # TypeScript interface definitions
│   └── utils/              # Helper functions (currency and date formatters)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.2 Spring Boot Backend Folder Structure
```
resort-backend/
├── src/
│   ├── main/
│   │   ├── java/com/resort/management/
│   │   │   ├── ResortApplication.java
│   │   │   ├── config/              # Global security, CORS, & Razorpay configs
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── WebConfig.java
│   │   │   │   └── RazorpayConfig.java
│   │   │   ├── core/                # Shared exception handlers & base classes
│   │   │   │   ├── exceptions/
│   │   │   │   └── audit/
│   │   │   ├── auth/                # JWT filters, UserDetails, and auth flow
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── dto/
│   │   │   │   └── jwt/
│   │   │   ├── booking/             # Booking engine domain module
│   │   │   │   ├── controller/
│   │   │   │   ├── model/           # Entities: Booking, BookingRoom
│   │   │   │   ├── repository/
│   │   │   │   └── service/
│   │   │   ├── inventory/           # Room inventory & category domain module
│   │   │   │   ├── controller/
│   │   │   │   ├── model/           # Entities: Room, RoomCategory, Inventory
│   │   │   │   ├── repository/
│   │   │   │   └── service/
│   │   │   ├── billing/             # Invoicing & GST payment module
│   │   │   │   ├── model/           # Entities: Invoice, Payment
│   │   │   │   └── service/
│   │   │   ├── housekeeping/        # Housekeeping tasks domain module
│   │   │   │   ├── controller/
│   │   │   │   ├── model/           # Entity: HousekeepingTask
│   │   │   │   └── service/
│   │   │   └── notification/        # Email/SMS notifications module
│   │   │       ├── service/
│   │   │       └── event/           # Spring Application Event Listeners
│   │   └── resources/
│   │       ├── db/migration/        # Flyway schema evolution files
│   │       │   ├── V1__init_schema.sql
│   │       │   └── V2__seed_roles_and_rooms.sql
│   │       └── application.yml      # Environment-specific configuration
└── pom.xml
```

---

## 3. Role-Based Access Control (RBAC) Matrix

We enforce strict endpoint security using Spring Security's `@PreAuthorize("hasRole('ROLE_...')")` on the backend, alongside Route Guards in Next.js middleware.

| Module Endpoint / Action | Guest | Housekeeping | Receptionist | Resort Manager | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Search Category Availability** | ✔ | ✔ | ✔ | ✔ | ✔ |
| **Initiate Direct Booking & Pay** | ✔ | ✘ | ✔ | ✔ | ✔ |
| **Manage Housekeeping Statuses** | ✘ | ✔ | ✘ | ✔ | ✔ |
| **Assign Physical Rooms at Check-In**| ✘ | ✘ | ✔ | ✔ | ✔ |
| **Checkout Guests & Handle Ledger** | ✘ | ✘ | ✔ | ✔ | ✔ |
| **Manage Tariffs, Seasons & Coupons**| ✘ | ✘ | ✘ | ✔ | ✔ |
| **Access Financial & Occupancy Reports**| ✘ | ✘ | ✘ | ✔ | ✔ |
| **Configure System Tax & Gateway Details**| ✘ | ✘ | ✘ | ✘ | ✔ |

---

## 4. Security & Authentication Architecture

### 4.1 JWT Authentication & Token Lifecycle
1. **User Sign-In:** The client sends credentials via `POST /auth/login`. On successful verification, the backend generates:
   - **Access Token:** Short-lived JWT (15 minutes). Signed with HMAC-SHA256 containing User ID, Mobile, and Roles claim.
   - **Refresh Token:** Long-lived secure UUID (7 days) stored securely in the database (`refresh_tokens` table).
2. **Access Token Delivery:** Sent in the JSON body payload.
3. **Refresh Token Delivery:** Sent in a secure HTTP-Only, SameSite=Strict cookie named `refresh_token` to prevent XSS intercept.
4. **Silent Refresh:** When the Next.js frontend detects access token expiration (or receives a HTTP 401 error from an API request), it calls `/auth/refresh`, passing the cookie. The backend verifies the refresh token against the database, updates the refresh token, and issues a new access token.

### 4.2 Security Protections
- **Password Hashing:** All password inputs are hashed using BCrypt with a cost factor of $12$ before write.
- **SQL Injection Prevention:** Enforced at compile-time by utilizing JPA Repository query parameters (`named queries` or standard methods) rather than raw string concatenation.
- **XSS Protection:** Next.js automatically escapes values rendered in React components. Content Security Policy (CSP) headers are configured on Vercel to only run scripts from trusted domains.
- **Rate Limiting:** Enforced via Spring Boot Bucket4j filter on sensitive endpoints (e.g., `/auth/login` restricted to 5 attempts per IP per minute; `/bookings/initiate` restricted to 10 attempts per IP per minute).
- **MFA Integration (Super Admin / Manager):** Ready for TOTP authenticator app verification during login sequence (to be activated in Phase 2).

---

## 5. Deployment & Infrastructure Architecture

```
+---------------------------------------------------------------------------------+
|                              Deployment Architecture                             |
+---------------------+---------------------+---------------------+---------------+
|  Frontend Hosting   |   Backend Hosting   |  Database Cloud     | Assets Cloud  |
|  Vercel Edge        |   Railway or AWS    |  Supabase PG Instance| Supabase      |
|  Network (Global)   |   Docker Container  |  Multi-AZ Backups   | Bucket (CDN)  |
+---------------------+---------------------+---------------------+---------------+
```

### 5.1 Infrastructure Components
- **Frontend App:** Deployed on **Vercel** with automatic multi-zone Edge distribution.
- **Backend API:** Containerized using Docker, hosted on **Railway** (or AWS App Runner / Elastic Beanstalk). Includes an auto-scaler that scales active instances based on CPU utilization exceeding 70%.
- **Database:** **Supabase (Managed PostgreSQL)** with point-in-time recovery (PITR) backups enabled.
- **Transactional Emails:** Triggered programmatically via HTTP calls using the **Resend Java SDK**.

---

## 6. Testing Strategy

### 6.1 Unit Testing
- **Backend:** JUnit 5 and Mockito are used to validate business logic in services (e.g., verifying coupon values and tax calculations).
- **Frontend:** Jest and React Testing Library are used to test individual component behavior and form validation errors.

### 6.2 Integration Testing
- **Spring Boot Testcontainers:** Spins up a real lightweight PostgreSQL Docker container during the test suite execution. This validates database migration scripts (Flyway) and confirms that database locking handles race conditions properly.

### 6.3 End-to-End (E2E) Testing
- **Playwright:** Automates browser test runs validating critical user journeys:
  - Select Deluxe Category -> Enter Guest Details -> Process Fake Razorpay checkout -> Assert confirmation display.
  - Reception login -> Search booking reference -> Assign Room -> Trigger check-in -> Verify room status updates.
