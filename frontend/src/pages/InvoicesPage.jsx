import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import InvoiceModal from "../components/InvoiceModal";

const API_URL = "http://localhost:8080/api";

function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please log in to view invoices.");
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/invoices/myInvoices`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load invoices");
                return res.json();
            })
            .then((data) => setInvoices(Array.isArray(data) ? data : []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <main className="app">
            <section className="spaces-section my-bookings-section">
                <div className="eyebrow">BILLING & INVOICING</div>
                <h1>Tax Invoices & Billing Records.</h1>
                <p>Download and print compliant tax receipts for all your co-working desk and cabin reservations.</p>

                {loading && <p className="message">Loading invoices...</p>}
                {error && <div className="message error">{error}</div>}

                {!loading && !error && invoices.length === 0 && (
                    <div className="empty-bookings">
                        <div className="empty-bookings-icon">📄</div>
                        <h2>No Invoices Yet</h2>
                        <p>Invoices are automatically generated when you book a workspace desk or cabin.</p>
                        <Link className="book-button booking-link" to="/">
                            Explore workspaces →
                        </Link>
                    </div>
                )}

                {!loading && invoices.length > 0 && (
                    <div className="invoices-table-card">
                        <table className="invoices-list-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Space & Desk</th>
                                    <th>Issue Date</th>
                                    <th>Period</th>
                                    <th>Tax (18%)</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td><strong>{inv.invoiceNumber}</strong></td>
                                        <td>
                                            <strong>{inv.spaceName}</strong>
                                            <div className="text-sub">Seat: {inv.deskCode || "Standard"}</div>
                                        </td>
                                        <td>{formatDate(inv.issueDate)}</td>
                                        <td>{formatDate(inv.startDate)} - {formatDate(inv.endDate)}</td>
                                        <td>₹{Number(inv.taxAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        <td><strong>₹{Number(inv.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></td>
                                        <td>
                                            <span className="invoice-status-pill">{inv.status}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="invoice-row-view-btn"
                                                onClick={() => setSelectedInvoice(inv)}
                                            >
                                                View / Print 🖨️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedInvoice && (
                <InvoiceModal
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </main>
    );
}

export default InvoicesPage;
