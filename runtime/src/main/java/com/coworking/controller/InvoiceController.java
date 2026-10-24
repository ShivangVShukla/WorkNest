package com.coworking.controller;

import com.coworking.dto.InvoiceResponse;
import com.coworking.entity.Invoice;
import com.coworking.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;

    @GetMapping("/myInvoices")
    public List<InvoiceResponse> getMyInvoices(Authentication authentication) {
        return invoiceRepository.findByUserEmailOrderByIssueDateDesc(authentication.getName())
                .stream()
                .map(InvoiceResponse::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/booking/{bookingId}")
    public InvoiceResponse getInvoiceByBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Invoice invoice = invoiceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        if (!invoice.getUser().getEmail().equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return new InvoiceResponse(invoice);
    }

    @GetMapping("/{id}")
    public InvoiceResponse getInvoiceById(
            @PathVariable Long id,
            Authentication authentication) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        if (!invoice.getUser().getEmail().equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return new InvoiceResponse(invoice);
    }
}
