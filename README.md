# Somnika Heritage Resort & Spa 🌴 - Hotel Booking Management System

A comprehensive, full-stack resort and hotel management system designed to streamline booking operations, staff management, and guest experiences. Built with a modern architecture separating a high-performance Next.js frontend from a robust Spring Boot backend.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Library:** React 18
- **Styling:** Tailwind CSS (Vanilla CSS utilities) with a custom luxury-themed design system
- **Icons:** Lucide React
- **Language:** TypeScript

### Backend
- **Framework:** Spring Boot (Java)
- **Database:** PostgreSQL
- **Migrations:** Flyway Database Migration
- **Security:** Spring Security with JWT Authentication & Role-Based Access Control (RBAC)
- **Performance:** Spring Cache (`@Cacheable`)
- **Observability:** Spring Boot Actuator
- **API Documentation:** Swagger / OpenAPI 3

---

## 🔄 Architecture & Technical Flow

This system operates on a decoupled architecture, ensuring scalability and ease of maintenance.

1. **Client-Side Rendering (CSR) & Server-Side Rendering (SSR):** 
   - Public pages (like the Home page and Room Catalog) use Next.js server-side rendering for SEO and fast initial loads, but utilize `force-dynamic` to ensure real-time availability fetching.
   - The secure dashboard uses CSR to provide a snappy, App-like experience for resort staff.
2. **Stateless Authentication:** 
   - The frontend authenticates via a centralized `auth.service.ts` connecting to the backend.
   - The backend issues HTTP-only JWT cookies for security, preventing XSS attacks. A refresh token rotation strategy is implemented.
3. **API Modularization:** 
   - The frontend communicates with the backend through modularized domain services (`booking.service.ts`, `rooms.service.ts`, `coupon.service.ts`, etc.), powered by a central interceptor that handles token refreshes and queues failed requests.
4. **Centralized Exception Handling:** 
   - The backend uses `@RestControllerAdvice` to catch domain-specific exceptions (like `IllegalArgumentException`) and formats them into consistent API error responses.

---

## 👥 User Roles & Business Flow (Non-Technical)

The system is designed around specific hotel operational roles, ensuring users only see what they need to.

### 1. The Guest (Customer Flow)
- **Discovery:** Guests visit the public site, view the luxury resort amenities, and browse the room catalog.
- **Booking:** Guests select dates, check real-time availability, and proceed to the booking wizard.
- **Promotions:** Guests can apply active discount vouchers/coupons during checkout.
- **Payment:** Integrated with payment gateways (e.g., Razorpay) for secure, immediate online booking confirmation.

### 2. Receptionist (`ROLE_RECEPTIONIST`)
*The front-line staff managing daily guest interactions.*
- **Walk-Ins:** Can create bookings manually for guests walking into the resort.
- **Check-In/Check-Out:** Processes guest arrivals (uploading ID proofs, assigning specific room numbers) and departures (billing extra incidentals).
- **Bookings Dashboard:** Views all upcoming, active, and past bookings.

### 3. Housekeeping (`ROLE_HOUSEKEEPING`)
*The operations staff ensuring rooms are ready.*
- **Task Dashboard:** Views rooms that need cleaning (automatically generated after guest check-out).
- **Task Updates:** Can "Claim" a cleaning task and mark it as "Complete" with notes once the room is ready for the next guest.

### 4. Manager (`ROLE_MANAGER`)
*The administrative staff overseeing operations and revenue.*
- **Inherits all Receptionist capabilities.**
- **Pricing Management:** Can edit base prices, capacities, and descriptions of room categories.
- **Coupon Management:** Can create, edit, and delete discount campaigns, setting minimum booking values and percentage/flat discounts.
- **Reports:** Access to revenue and occupancy analytics.

### 5. Super Admin (`ROLE_SUPER_ADMIN`)
- Has unrestricted access to all modules, settings, and user management across the platform.

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18+)
- Java 17+
- PostgreSQL

### 1. Backend Setup
1. Navigate to the `/backend` directory.
2. Ensure you have a PostgreSQL database running and update the `application.yml` (or your environment variables) with your database credentials (`SPRING_DATASOURCE_URL`, etc.).
3. Run the application using Gradle:
   ```bash
   ./gradlew bootRun
   ```
4. *Note: Swagger API docs will be available at `http://localhost:8080/swagger-ui.html` and Actuator health checks at `http://localhost:8080/actuator/health`.*

### 2. Frontend Setup
1. Navigate to the `/frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:3000`.

---
*Built to bring timeless hospitality into the digital age.*
