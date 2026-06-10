package com.resort.management.booking.service;

import com.resort.management.billing.model.Invoice;
import com.resort.management.billing.model.Payment;
import com.resort.management.billing.repository.PaymentRepository;
import com.resort.management.billing.service.InvoiceService;
import com.resort.management.booking.dto.BookingRequest;
import com.resort.management.booking.model.Booking;
import com.resort.management.booking.model.Coupon;
import com.resort.management.booking.model.Guest;
import com.resort.management.booking.repository.BookingRepository;
import com.resort.management.booking.repository.CouponRepository;
import com.resort.management.booking.repository.GuestRepository;
import com.resort.management.housekeeping.service.HousekeepingService;
import com.resort.management.inventory.model.Room;
import com.resort.management.inventory.model.RoomCategory;
import com.resort.management.inventory.model.RoomCategoryInventory;
import com.resort.management.inventory.repository.RoomCategoryInventoryRepository;
import com.resort.management.inventory.repository.RoomCategoryRepository;
import com.resort.management.inventory.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private RoomCategoryRepository categoryRepository;

    @Autowired
    private RoomCategoryInventoryRepository inventoryRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private HousekeepingService housekeepingService;

    @Transactional
    public Booking initiateBooking(BookingRequest request) {
        // 1. Retrieve or Create Guest profile
        Guest guest = guestRepository.findByEmail(request.getEmail())
                .orElseGet(() -> Guest.builder()
                        .email(request.getEmail())
                        .mobile(request.getMobile())
                        .build());

        // Update fields
        guest.setFirstName(request.getFirstName());
        guest.setLastName(request.getLastName());
        guest.setAddress(request.getAddress());
        guest.setCity(request.getCity());
        guest.setStateCode(request.getStateCode().toUpperCase());
        guest.setGstin(request.getGstin() != null ? request.getGstin().toUpperCase() : null);
        guest = guestRepository.save(guest);

        // 2. Resolve Category
        RoomCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.getCategoryId()));

        // Validate Capacity
        if (request.getAdults() > category.getCapacity()) {
            throw new IllegalArgumentException("Guest count exceeds room category capacity limit.");
        }

        // Validate Dates
        LocalDate checkIn = request.getCheckIn();
        LocalDate checkOut = request.getCheckOut();
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in date cannot be in the past.");
        }

        // 3. Acquire pessimistic write lock on daily inventories for the selected dates
        LocalDate endDate = checkOut.minusDays(1);
        List<RoomCategoryInventory> inventories = inventoryRepository
                .findByCategoryAndInventoryDateBetweenWithLock(category, checkIn, endDate);

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (inventories.size() < nights) {
            throw new IllegalArgumentException("Requested dates are outside the configured inventory window.");
        }

        // 4. Verify inventory counts
        for (RoomCategoryInventory rci : inventories) {
            int availableCount = rci.getTotalInventory() - rci.getBookedCount() - rci.getBlockedCount();
            if (availableCount <= 0) {
                throw new IllegalStateException("Room category is fully booked on: " + rci.getInventoryDate());
            }
        }

        // 5. Increment booked counts for each daily inventory record
        for (RoomCategoryInventory rci : inventories) {
            rci.setBookedCount(rci.getBookedCount() + 1);
            inventoryRepository.save(rci);
        }

        // 6. Calculate pricing
        BigDecimal basePrice = category.getBasePrice().multiply(BigDecimal.valueOf(nights));
        BigDecimal discount = BigDecimal.ZERO;
        Coupon coupon = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Optional<Coupon> optCoupon = couponRepository.findByCode(request.getCouponCode().toUpperCase());
            if (optCoupon.isPresent()) {
                coupon = optCoupon.get();
                // Validate Coupon
                if (coupon.getIsActive() &&
                    !LocalDate.now().isBefore(coupon.getStartDate()) &&
                    !LocalDate.now().isAfter(coupon.getExpiryDate()) &&
                    (coupon.getUsageLimit() == null || coupon.getUsedCount() < coupon.getUsageLimit()) &&
                    basePrice.compareTo(coupon.getMinBookingValue()) >= 0) {

                    if ("PERCENTAGE".equals(coupon.getDiscountType())) {
                        discount = basePrice.multiply(coupon.getDiscountValue().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
                        if (coupon.getMaxDiscountValue() != null && discount.compareTo(coupon.getMaxDiscountValue()) > 0) {
                            discount = coupon.getMaxDiscountValue();
                        }
                    } else if ("FIXED".equals(coupon.getDiscountType())) {
                        discount = coupon.getDiscountValue();
                    }

                    // Increment coupon usage
                    coupon.setUsedCount(coupon.getUsedCount() + 1);
                    couponRepository.save(coupon);
                }
            }
        }

        BigDecimal taxableAmount = basePrice.subtract(discount);
        BigDecimal pricePerNight = baseAmountPerNight(taxableAmount, nights);
        BigDecimal gstRate = pricePerNight.compareTo(new BigDecimal("7500.00")) >= 0 ? new BigDecimal("0.18") : new BigDecimal("0.12");
        BigDecimal tax = taxableAmount.multiply(gstRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = taxableAmount.add(tax);

        // Generate Booking Reference
        String reference = String.format("RES-%tY%<tm%<td-%04d", LocalDate.now(), new Random().nextInt(10000));

        Booking booking = Booking.builder()
                .bookingReference(reference)
                .guest(guest)
                .category(category)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .adultsCount(request.getAdults())
                .childrenCount(request.getChildren())
                .bookingStatus("PENDING_PAYMENT")
                .coupon(coupon)
                .baseAmount(basePrice)
                .discountAmount(discount)
                .taxAmount(tax)
                .grandTotal(grandTotal)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        booking = bookingRepository.save(booking);

        // 7. Initialize/mock Razorpay payment transaction
        String mockRazorpayOrderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 12);
        Payment payment = Payment.builder()
                .booking(booking)
                .razorpayOrderId(mockRazorpayOrderId)
                .paymentMethod("UPI")
                .paymentStatus("PENDING")
                .amount(grandTotal)
                .transactionTime(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        logger.info("Booking initialized: Reference={}, Temp ID={}, Razorpay Order ID={}", reference, booking.getId(), mockRazorpayOrderId);
        return booking;
    }

    private BigDecimal baseAmountPerNight(BigDecimal taxableAmount, long nights) {
        return taxableAmount.divide(BigDecimal.valueOf(nights == 0 ? 1 : nights), 2, RoundingMode.HALF_UP);
    }

    @Transactional
    public void confirmBookingPayment(String razorpayOrderId, String razorpayPaymentId, String signature) {
        Payment payment = paymentRepository.findByRazorpayOrderIdOrBookingReference(razorpayOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for Razorpay Order ID: " + razorpayOrderId));

        Booking booking = payment.getBooking();

        // If booking is already confirmed, ignore (idempotence)
        if ("CONFIRMED".equals(booking.getBookingStatus())) {
            return;
        }

        // Edge Case: Webhook arrived late after 10m session timeout
        if ("EXPIRED".equals(booking.getBookingStatus())) {
            logger.warn("Late payment received for expired booking: reference={}, initiating refund.", booking.getBookingReference());
            payment.setPaymentStatus("REFUNDED");
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(signature);
            paymentRepository.save(payment);

            booking.setBookingStatus("TIMEOUT_REFUNDED");
            bookingRepository.save(booking);

            // MOCK REFUND CALL:
            // razorpayClient.refunds.create(...)
            logger.info("Mock refund successful for Booking ID: {}", booking.getId());
            return;
        }

        // Normal flow
        payment.setPaymentStatus("SUCCESSFUL");
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(signature);
        payment.setTransactionTime(LocalDateTime.now());
        paymentRepository.save(payment);

        booking.setBookingStatus("CONFIRMED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Generate GST Invoice
        Invoice invoice = invoiceService.createInvoice(booking);
        logger.info("Booking confirmed and invoice generated. Reference={}, Invoice No={}", booking.getBookingReference(), invoice.getInvoiceNumber());

        // Send Email confirmation mock
        logger.info("[EMAIL TRIGGER] Send confirmation email to {} for booking {}", booking.getGuest().getEmail(), booking.getBookingReference());
    }

    @Transactional
    public Booking assignRoomAndCheckIn(UUID bookingId, Long roomId, String idProofType, String idProofUrl) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found."));

        if (!"CONFIRMED".equals(booking.getBookingStatus())) {
            throw new IllegalStateException("Booking must be CONFIRMED to check-in. Current status: " + booking.getBookingStatus());
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found."));

        if (!"AVAILABLE".equals(room.getStatus())) {
            throw new IllegalStateException("Selected room is not AVAILABLE. Current status: " + room.getStatus());
        }

        if (!room.getCategory().getId().equals(booking.getCategory().getId())) {
            throw new IllegalArgumentException("Room category does not match booked category.");
        }

        // Mark Room as Occupied
        room.setStatus("OCCUPIED");
        roomRepository.save(room);

        // Assign Room to Booking
        booking.getAssignedRooms().add(room);
        booking.setBookingStatus("CHECKED_IN");
        booking.setUpdatedAt(LocalDateTime.now());

        // Update Guest ID Proof
        Guest guest = booking.getGuest();
        guest.setIdProofType(idProofType);
        guest.setIdProofUrl(idProofUrl);
        guestRepository.save(guest);

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking processCheckOut(UUID bookingId, BigDecimal extraIncidentals, String paymentMethod, String txRef) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found."));

        if (!"CHECKED_IN".equals(booking.getBookingStatus())) {
            throw new IllegalStateException("Booking must be CHECKED_IN to process checkout.");
        }

        // Handle extra payments if incidentals are present
        if (extraIncidentals != null && extraIncidentals.compareTo(BigDecimal.ZERO) > 0) {
            booking.setGrandTotal(booking.getGrandTotal().add(extraIncidentals));
            Payment incidentalPayment = Payment.builder()
                    .booking(booking)
                    .paymentMethod(paymentMethod)
                    .paymentStatus("SUCCESSFUL")
                    .amount(extraIncidentals)
                    .razorpayPaymentId(txRef != null ? txRef : "cash_" + UUID.randomUUID().toString().substring(0, 8))
                    .transactionTime(LocalDateTime.now())
                    .build();
            paymentRepository.save(incidentalPayment);
        }

        // Update booking status
        booking.setBookingStatus("CHECKED_OUT");
        booking.setUpdatedAt(LocalDateTime.now());

        // Release assigned rooms and trigger housekeeping cleaning
        for (Room room : booking.getAssignedRooms()) {
            housekeepingService.createCleaningTask(room);
        }

        // Update Guest loyalty history
        Guest guest = booking.getGuest();
        guest.setTotalStays(guest.getTotalStays() + 1);
        guest.setTotalSpend(guest.getTotalSpend().add(booking.getGrandTotal()));
        guestRepository.save(guest);

        return bookingRepository.save(booking);
    }

    // Background Scheduler: Expire pending payments after 10 minutes
    @Scheduled(fixedDelay = 60000) // Runs every minute
    @Transactional
    public void expirePendingBookings() {
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minus(10, ChronoUnit.MINUTES);
        List<Booking> expiredBookings = bookingRepository.findByBookingStatusAndCreatedAtBefore("PENDING_PAYMENT", tenMinutesAgo);

        for (Booking booking : expiredBookings) {
            logger.info("Expiring booking checkout session due to payment timeout: Reference={}", booking.getBookingReference());
            booking.setBookingStatus("EXPIRED");
            booking.setUpdatedAt(LocalDateTime.now());
            bookingRepository.save(booking);

            // Release locked inventory
            LocalDate endDate = booking.getCheckOutDate().minusDays(1);
            List<RoomCategoryInventory> inventories = inventoryRepository
                    .findByCategoryAndInventoryDateBetween(booking.getCategory(), booking.getCheckInDate(), endDate);

            for (RoomCategoryInventory rci : inventories) {
                rci.setBookedCount(Math.max(0, rci.getBookedCount() - 1));
                inventoryRepository.save(rci);
            }
        }
    }
}
