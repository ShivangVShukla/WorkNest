import React from "react";

function InvoiceModal({ invoice, onClose }) {
    if (!invoice) return null;

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="invoice-modal-overlay" onClick={onClose}>
            <div className="invoice-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="invoice-modal-actions no-print">
                    <button className="invoice-print-btn" onClick={handlePrint}>
                        🖨️ Print / Download PDF
                    </button>
                    <button className="invoice-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="invoice-printable-area">
                    <div className="invoice-header">
                        <div>
                            <div className="invoice-brand">
                                <span className="invoice-brand-icon">w.</span>
                                <div>
                                    <h2>worknest</h2>
                                    <p className="invoice-subtext">Co-Working & Private Cabin Network</p>
                                </div>
                            </div>
                            <div className="invoice-meta-left">
                                <p>GSTIN: 29AABCU9603R1ZM</p>
                                <p>contact@worknest.io | +91 80 4920 1100</p>
                            </div>
                        </div>

                        <div className="invoice-meta-right">
                            <span className="invoice-badge-status">{invoice.status || "PAID"}</span>
                            <h3>TAX INVOICE</h3>
                            <p><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
                            <p><strong>Date:</strong> {formatDate(invoice.issueDate)}</p>
                            <p><strong>Payment Method:</strong> {invoice.paymentMethod || "Credit Card / Net Banking"}</p>
                        </div>
                    </div>

                    <div className="invoice-divider" />

                    <div className="invoice-parties">
                        <div className="invoice-party-col">
                            <span className="party-title">BILLED TO (MEMBER)</span>
                            <strong>{invoice.userName}</strong>
                            <p>{invoice.userEmail}</p>
                            <p>Member ID: #{invoice.userId}</p>
                        </div>
                        <div className="invoice-party-col">
                            <span className="party-title">RESERVATION LOCATION</span>
                            <strong>{invoice.spaceName}</strong>
                            <p>{invoice.spaceLocation}</p>
                            <p>Desk / Cabin: <strong>{invoice.deskCode || "Standard Workspace"}</strong></p>
                        </div>
                    </div>

                    <div className="invoice-table-wrapper">
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Pass Type</th>
                                    <th>Period</th>
                                    <th className="align-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <strong>{invoice.spaceName}</strong>
                                        <div className="table-item-desc">
                                            {invoice.deskCode !== "N/A"
                                                ? `Reserved Seat: ${invoice.deskCode}`
                                                : "Dedicated Workspace Access"}
                                        </div>
                                    </td>
                                    <td>{invoice.bookingType === "DAILY" ? "Daily Pass" : "Monthly Membership"}</td>
                                    <td>{formatDate(invoice.startDate)} → {formatDate(invoice.endDate)}</td>
                                    <td className="align-right">
                                        ₹{Number(invoice.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="invoice-summary-box">
                        <div className="summary-line">
                            <span>Subtotal:</span>
                            <span>₹{Number(invoice.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="summary-line">
                            <span>GST (18% Integrated Tax):</span>
                            <span>₹{Number(invoice.taxAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="summary-line grand-total">
                            <span>Total Paid:</span>
                            <span>₹{Number(invoice.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="invoice-footer">
                        <p>Thank you for choosing WorkNest for your workspace. This is a computer-generated tax invoice.</p>
                        <p className="invoice-tagline">Make space for great work.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InvoiceModal;
