package com.coworking.service;

import com.coworking.entity.Booking;
import com.coworking.entity.Invoice;
import com.coworking.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Transactional
    public Invoice createInvoiceForBooking(Booking booking) {
        return invoiceRepository.findByBookingId(booking.getId())
                .orElseGet(() -> {
                    BigDecimal total = booking.getTotalPrice();
                    // Let subtotal + 18% GST = total => subtotal = total / 1.18
                    BigDecimal subtotal = total.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
                    BigDecimal tax = total.subtract(subtotal);

                    Invoice invoice = new Invoice();
                    invoice.setBooking(booking);
                    invoice.setUser(booking.getUser());
                    invoice.setInvoiceNumber("INV-" + System.currentTimeMillis() + "-" + booking.getId());
                    invoice.setSubtotal(subtotal);
                    invoice.setTaxAmount(tax);
                    invoice.setTotalAmount(total);
                    invoice.setStatus(Invoice.InvoiceStatus.PAID);
                    invoice.setIssueDate(LocalDateTime.now());
                    invoice.setPaidDate(LocalDateTime.now());
                    invoice.setPaymentMethod("CREDIT_CARD");

                    return invoiceRepository.save(invoice);
                });
    }
}
