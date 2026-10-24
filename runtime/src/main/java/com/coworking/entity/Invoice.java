package com.coworking.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber; // e.g. "INV-2026-1001"

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount; // 18% GST

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.PAID;

    @Column(nullable = false)
    private LocalDateTime issueDate;

    private LocalDateTime paidDate;

    private String paymentMethod = "CREDIT_CARD"; // CREDIT_CARD, UPI, NET_BANKING

    @PrePersist
    public void onCreate() {
        if (issueDate == null) {
            issueDate = LocalDateTime.now();
        }
        if (status == InvoiceStatus.PAID && paidDate == null) {
            paidDate = LocalDateTime.now();
        }
    }

    public enum InvoiceStatus {
        PAID, PENDING, REFUNDED
    }
}
