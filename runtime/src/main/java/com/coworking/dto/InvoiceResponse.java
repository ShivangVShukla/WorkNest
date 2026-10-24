package com.coworking.dto;

import com.coworking.entity.Invoice;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class InvoiceResponse {
    private final Long id;
    private final String invoiceNumber;
    private final Long bookingId;
    private final Long userId;
    private final String userName;
    private final String userEmail;
    private final String spaceName;
    private final String spaceLocation;
    private final String deskCode;
    private final String bookingType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final BigDecimal subtotal;
    private final BigDecimal taxAmount;
    private final BigDecimal totalAmount;
    private final Invoice.InvoiceStatus status;
    private final LocalDateTime issueDate;
    private final LocalDateTime paidDate;
    private final String paymentMethod;

    public InvoiceResponse(Invoice invoice) {
        this.id = invoice.getId();
        this.invoiceNumber = invoice.getInvoiceNumber();
        this.bookingId = invoice.getBooking().getId();
        this.userId = invoice.getUser().getId();
        this.userName = invoice.getUser().getName();
        this.userEmail = invoice.getUser().getEmail();
        this.spaceName = invoice.getBooking().getSpace().getName();
        this.spaceLocation = invoice.getBooking().getSpace().getLocation();
        this.deskCode = invoice.getBooking().getDesk() != null ? invoice.getBooking().getDesk().getDeskCode() : "N/A";
        this.bookingType = invoice.getBooking().getBookingType().name();
        this.startDate = invoice.getBooking().getStartDate();
        this.endDate = invoice.getBooking().getEndDate();
        this.subtotal = invoice.getSubtotal();
        this.taxAmount = invoice.getTaxAmount();
        this.totalAmount = invoice.getTotalAmount();
        this.status = invoice.getStatus();
        this.issueDate = invoice.getIssueDate();
        this.paidDate = invoice.getPaidDate();
        this.paymentMethod = invoice.getPaymentMethod();
    }
}
