# Database Schema & API Specifications

---

## 1. Database Design (PostgreSQL Schema)

The following PostgreSQL DDL schema represents a production-grade database design with foreign keys, checks, indexes, and constraints.

```sql
-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- ==========================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'ROLE_GUEST', 'ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_HOUSEKEEPING', 'ROLE_SUPER_ADMIN'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'room:read', 'room:write', 'booking:create', 'report:read'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. GUEST MANAGEMENT
-- ==========================================

CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    state_code VARCHAR(5) NOT NULL, -- Two-letter Indian State Code (e.g., 'MH', 'GA', 'DL')
    gstin VARCHAR(15), -- Optional Indian GSTIN format: 22AAAAA0000A1Z5
    id_proof_type VARCHAR(30), -- 'AADHAR', 'PASSPORT', 'VOTER_ID', 'PAN'
    id_proof_url TEXT, -- Link to document in Supabase bucket
    total_stays INT DEFAULT 0,
    total_spend NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_gstin CHECK (gstin IS NULL OR gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
);

-- ==========================================
-- 3. ROOMS & INVENTORY
-- ==========================================

CREATE TABLE room_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'Deluxe Room', 'Suite Room'
    description TEXT,
    capacity INT NOT NULL CHECK (capacity > 0),
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0.00),
    amenities TEXT[], -- e.g., '{"AC", "WiFi", "Minibar", "Private Pool"}'
    images TEXT[], -- Array of Supabase file URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL, -- e.g., '101', '204'
    category_id INT NOT NULL REFERENCES room_categories(id) ON DELETE RESTRICT,
    floor INT NOT NULL CHECK (floor >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_room_status CHECK (status IN ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'))
);

-- Daily Inventory tracking table for the Booking Engine to avoid dynamic counts on large joins
CREATE TABLE room_category_inventory (
    id BIGSERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES room_categories(id) ON DELETE CASCADE,
    inventory_date DATE NOT NULL,
    total_inventory INT NOT NULL, -- Total rooms in that category
    booked_count INT NOT NULL DEFAULT 0, -- Active bookings
    blocked_count INT NOT NULL DEFAULT 0, -- Maintenance blocks
    version INT NOT NULL DEFAULT 0, -- Optimistic lock support
    CONSTRAINT unique_category_date UNIQUE (category_id, inventory_date),
    CONSTRAINT chk_booked_limit CHECK (booked_count + blocked_count <= total_inventory)
);

-- ==========================================
-- 4. BOOKINGS & INVOICES
-- ==========================================

CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'PERCENTAGE', 'FIXED'
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_booking_value NUMERIC(10, 2) DEFAULT 0.00,
    max_discount_value NUMERIC(10, 2), -- Cap for percentage coupons
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    usage_limit INT CHECK (usage_limit > 0),
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_coupon_dates CHECK (expiry_date >= start_date),
    CONSTRAINT chk_coupon_type CHECK (discount_type IN ('PERCENTAGE', 'FIXED'))
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'RES-20261012-001'
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    category_id INT NOT NULL REFERENCES room_categories(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adults_count INT NOT NULL CHECK (adults_count > 0),
    children_count INT DEFAULT 0 CHECK (children_count >= 0),
    booking_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
    coupon_id INT REFERENCES coupons(id) ON DELETE SET NULL,
    base_amount NUMERIC(12, 2) NOT NULL, -- Sum of room tariff for all nights
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00, -- GST total
    grand_total NUMERIC(12, 2) NOT NULL, -- (base - discount) + tax
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT chk_booking_status CHECK (booking_status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'EXPIRED', 'TIMEOUT_REFUNDED'))
);

-- Links a Booking to assigned physical rooms (nullable before check-in)
CREATE TABLE booking_rooms (
    id BIGSERIAL PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(255),
    payment_method VARCHAR(30) NOT NULL, -- 'UPI', 'CARD', 'NET_BANKING', 'CASH', 'REFUND'
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED'
    amount NUMERIC(12, 2) NOT NULL,
    transaction_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED'))
);

CREATE TABLE coupon_usage (
    id BIGSERIAL PRIMARY KEY,
    coupon_id INT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(30) UNIQUE NOT NULL, -- e.g., 'INV/2026-27/0043'
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    base_tariff_total NUMERIC(12, 2) NOT NULL,
    discount_applied NUMERIC(12, 2) DEFAULT 0.00,
    cgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    sgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    igst_amount NUMERIC(12, 2) DEFAULT 0.00,
    gst_percentage NUMERIC(5, 2) NOT NULL, -- e.g. 12.00 or 18.00
    grand_total NUMERIC(12, 2) NOT NULL,
    gstin_resort VARCHAR(15) NOT NULL,
    sac_code VARCHAR(10) NOT NULL DEFAULT '996311',
    place_of_supply VARCHAR(5) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. OPERATIONS & AUDIT LOGS
-- ==========================================

CREATE TABLE housekeeping_tasks (
    id BIGSERIAL PRIMARY KEY,
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    task_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Null for guest public actions
    action_type VARCHAR(100) NOT NULL, -- e.g. 'BOOKING_CREATE', 'ROOM_ASSIGNED', 'CHECK_IN_COMPLETE'
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    recipient_email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    notification_type VARCHAR(30) NOT NULL, -- 'EMAIL_CONFIRMATION', 'EMAIL_INVOICE', 'SMS_ALERT'
    sent_status BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES FOR HIGH SEARCH PERFORMANCE
-- ==========================================

CREATE INDEX idx_inventory_lookup ON room_category_inventory (category_id, inventory_date);
CREATE INDEX idx_booking_dates ON bookings (check_in_date, check_out_date);
CREATE INDEX idx_booking_status ON bookings (booking_status);
CREATE INDEX idx_rooms_status ON rooms (status);
CREATE INDEX idx_rooms_category ON rooms (category_id);
CREATE INDEX idx_guests_mobile ON guests (mobile);
CREATE INDEX idx_guests_email ON guests (email);
CREATE INDEX idx_payments_order ON payments (razorpay_order_id);
CREATE INDEX idx_invoice_booking ON invoices (booking_id);
CREATE INDEX idx_housekeeping_status ON housekeeping_tasks (task_status);
```

---

## 2. Entity-Relationship Model (ERD Description)

```
                       [roles] --< [user_roles] >-- [users] >-- [refresh_tokens]
                          |
                      [role_permissions]
                          |
                     [permissions]

                     [room_categories] --< [rooms] --< [booking_rooms] >-- [bookings]
                            |                                                 |
                     [room_category_inventory]                                |--< [payments]
                                                                              |--< [coupon_usage]
                                                                              |--< [invoices]
                                                                              |--< [notifications]
                     [coupons] -----------------------------------------------|
                                                                              |
                     [guests] ------------------------------------------------|

                     [rooms] --< [housekeeping_tasks]
                     [users] -------| (assigned_to)
```

- **One-to-Many Relationships:**
  - `guests` to `bookings` (A guest can book multiple times).
  - `room_categories` to `rooms` (A category like "Deluxe Room" contains multiple physical rooms).
  - `room_categories` to `room_category_inventory` (Daily inventory splits mapped to specific categories).
  - `bookings` to `payments` (A booking can have multiple payment attempts/refunds).
  - `bookings` to `invoices` (Typically 1 final checkout invoice, but supports multiple revisions).
  - `bookings` to `booking_rooms` (A single booking can have multiple rooms allocated).
  - `coupons` to `coupon_usage` (A coupon can be used by multiple bookings).
- **Many-to-Many Relationships:**
  - `users` and `roles` via join table `user_roles`.
  - `roles` and `permissions` via join table `role_permissions`.

---

## 3. REST API Specifications

All API paths are prefixed with `/api/v1`. Authenticated requests require the HTTP Header `Authorization: Bearer <JWT_ACCESS_TOKEN>`.

### 3.1 Authentication APIs
- **POST `/auth/login`**: Authenticates user credentials and returns access & refresh tokens.
- **POST `/auth/refresh`**: Validates a refresh token and generates a new access token.

### 3.2 Availability APIs
- **GET `/availability`**: Check category room counts for date ranges.
  - **Query Parameters:** `checkIn` (YYYY-MM-DD), `checkOut` (YYYY-MM-DD), `guests` (integer).

#### Response Payload (200 OK)
```json
{
  "searchCriteria": {
    "checkIn": "2026-10-12",
    "checkOut": "2026-10-15",
    "nightsCount": 3,
    "guests": 2
  },
  "categories": [
    {
      "id": 1,
      "name": "Deluxe Room",
      "capacity": 3,
      "basePricePerNight": 6500.00,
      "availableCount": 5,
      "amenities": ["AC", "WiFi", "Television"],
      "images": ["https://supabase.co/.../deluxe1.webp"]
    },
    {
      "id": 2,
      "name": "Suite Room",
      "capacity": 4,
      "basePricePerNight": 12500.00,
      "availableCount": 2,
      "amenities": ["AC", "WiFi", "Minibar", "Private Pool"],
      "images": ["https://supabase.co/.../suite1.webp"]
    }
  ]
}
```

### 3.3 Booking & Checkout APIs
- **POST `/bookings/initiate`**: Validates parameters, blocks category inventory, and initializes Razorpay checkout.
  - **Request Body:**
    ```json
    {
      "checkIn": "2026-10-12",
      "checkOut": "2026-10-15",
      "categoryId": 2,
      "adults": 2,
      "children": 0,
      "guest": {
        "firstName": "Aarav",
        "lastName": "Mehta",
        "email": "aarav.mehta@gmail.com",
        "mobile": "+919876543210",
        "address": "Bldg 45, Bandra West",
        "city": "Mumbai",
        "stateCode": "MH",
        "gstin": "27AAAAA1111A1Z1"
      },
      "couponCode": "ANNIVERSARY10"
    }
    ```
  - **Response Payload (201 Created):**
    ```json
    {
      "bookingId": "09876543-abcd-ef01-2345-6789abcdef01",
      "bookingReference": "RES-20261012-045",
      "razorpayOrderId": "order_Pkls893jsh8392",
      "amount": 27081.00,
      "currency": "INR",
      "status": "PENDING_PAYMENT",
      "expiresAt": "2026-06-09T16:50:00Z"
    }
    ```

- **POST `/payments/webhook`**: Receives Razorpay asynchronous payment update. Unprotected endpoint requiring Razorpay HMAC signature validation.
  - **Request Body:**
    ```json
    {
      "entity": "event",
      "account_id": "acc_HJsh782ks",
      "event": "order.paid",
      "payload": {
        "payment": {
          "entity": {
            "id": "pay_Pkjs8392js83",
            "amount": 2708100,
            "currency": "INR",
            "status": "captured",
            "order_id": "order_Pkls893jsh8392",
            "method": "upi",
            "email": "aarav.mehta@gmail.com",
            "contact": "+919876543210"
          }
        }
      }
    }
    ```

### 3.4 Front Office & Operations APIs
- **POST `/bookings/{id}/check-in`**: Assign room number and check guest in. Requires `ROLE_RECEPTIONIST` or above.
  - **Request Body:**
    ```json
    {
      "assignedRoomId": 105,
      "idProofType": "AADHAR",
      "idProofUrl": "https://supabase.co/storage/v1/object/public/proofs/aarav_aadhar.pdf"
    }
    ```
- **POST `/bookings/{id}/check-out`**: Generates invoice, settles extra charges, and checks out guest.
  - **Request Body:**
    ```json
    {
      "additionalIncidentals": [
        {
          "description": "Laundry Service",
          "amount": 1200.00
        }
      ],
      "settlementMethod": "CARD",
      "settlementReference": "txn_89438920"
    }
    ```

---

## 4. Input Validation & Data Verification Rules

To maintain high data integrity, the Spring Boot application validates inputs at the Controller layer using `@Valid` annotations and Hibernate Validator.

### 4.1 Regular Expression Validation Constraints
1. **Indian Mobile Numbers:**
   - Expression: `^(?:\+91|0)?[6-9]\d{9}$`
   - Description: Supports mobile numbers starting with optional prefix (+91 or 0) followed by 10 digits starting with 6, 7, 8, or 9.
2. **Indian GSTIN Verification:**
   - Expression: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
   - Description: Matches the 15-digit alphanumeric Goods and Services Tax Identification Number structure.
3. **Email Structure:**
   - Standard RFC 5322 compliance pattern checking for domain structure and TLD length.
4. **Indian PAN (required if GSTIN is provided):**
   - Expression: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`

### 4.2 Business Logic Validation Rules
- **Date Chronology:** In any availability search or booking request, the checkout date must be strictly after the check-in date (`check_out_date > check_in_date`).
- **Check-in/Out Range Boundaries:** Dates must be in the future relative to the system date. Hotel check-in time boundary: dynamic depending on configuration, default 12:00 PM; check-out boundary: 10:00 AM.
- **Adult Capacity Validation:** For bookings, the sum of `adults_count` must not exceed the capacity limit defined in the targeted `room_category` record.
- **State Codes:** The place of supply must match a list of valid two-digit Indian state codes (e.g. `MH` for Maharashtra, `GA` for Goa, `DL` for Delhi) to guarantee accurate CGST/SGST vs IGST invoice generation.
