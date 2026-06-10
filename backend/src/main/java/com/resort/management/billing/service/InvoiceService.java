package com.resort.management.billing.service;

import com.resort.management.billing.model.Invoice;
import com.resort.management.billing.repository.InvoiceRepository;
import com.resort.management.booking.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    private static final String RESORT_GSTIN = "30AAAAA1111A1Z1"; // Goa GSTIN (starts with 30)
    private static final String RESORT_STATE_CODE = "GA"; // Resort is based in Goa

    @Transactional
    public Invoice createInvoice(Booking booking) {
        // Prevent double generation
        if (invoiceRepository.findByBookingId(booking.getId()).isPresent()) {
            return invoiceRepository.findByBookingId(booking.getId()).get();
        }

        // Calculate GST Slab based on night tariff (base tariff per night)
        long nights = booking.getCheckInDate().datesUntil(booking.getCheckOutDate()).count();
        if (nights == 0) nights = 1;

        BigDecimal pricePerNight = booking.getBaseAmount().divide(BigDecimal.valueOf(nights), 2, RoundingMode.HALF_UP);
        BigDecimal gstRate;

        // CBIC Slabs: 12% if tariff < ₹7,500/night; 18% if tariff >= ₹7,500/night
        if (pricePerNight.compareTo(new BigDecimal("7500.00")) >= 0) {
            gstRate = new BigDecimal("0.18");
        } else {
            gstRate = new BigDecimal("0.12");
        }

        BigDecimal baseAmount = booking.getBaseAmount();
        BigDecimal discount = booking.getDiscountAmount();
        BigDecimal taxableValue = baseAmount.subtract(discount);

        BigDecimal totalTax = taxableValue.multiply(gstRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal cgst = BigDecimal.ZERO;
        BigDecimal sgst = BigDecimal.ZERO;
        BigDecimal igst = BigDecimal.ZERO;

        String guestState = booking.getGuest().getStateCode();

        if (RESORT_STATE_CODE.equalsIgnoreCase(guestState)) {
            // Intrastate: CGST (half) + SGST (half)
            cgst = totalTax.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            sgst = totalTax.subtract(cgst); // Subtract to avoid rounding errors
        } else {
            // Interstate: IGST (full)
            igst = totalTax;
        }

        BigDecimal grandTotal = taxableValue.add(totalTax);

        // Update booking tax and grand total in the database
        booking.setTaxAmount(totalTax);
        booking.setGrandTotal(grandTotal);

        // Generate a sequential-like invoice number (simple UUID hash for mock, or INV-YYYY-MM-index)
        long currentCount = invoiceRepository.count() + 1;
        String invoiceNumber = String.format("INV/%d/%04d", LocalDate.now().getYear(), currentCount);

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .booking(booking)
                .invoiceDate(LocalDate.now())
                .baseTariffTotal(baseAmount)
                .discountApplied(discount)
                .cgstAmount(cgst)
                .sgstAmount(sgst)
                .igstAmount(igst)
                .gstPercentage(gstRate.multiply(BigDecimal.valueOf(100)))
                .grandTotal(grandTotal)
                .gstinResort(RESORT_GSTIN)
                .sacCode("996311")
                .placeOfSupply(guestState)
                .build();

        return invoiceRepository.save(invoice);
    }
}
