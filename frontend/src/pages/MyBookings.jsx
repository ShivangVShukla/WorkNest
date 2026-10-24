import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import InvoiceModal from "../components/InvoiceModal";

const API_URL = "http://localhost:8080/api";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [trackingId, setTrackingId] = useState(null);
    const [message, setMessage] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const loadBookings = useCallback(async () => {
        setError("");
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Please log in to view your bookings.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/bookings/myBookings`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message || data?.detail || "Unable to load your bookings."
                );
            }

            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const handleCheckIn = async (bookingId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setTrackingId(bookingId);
        setError("");
        setMessage("");

        try {
            const res = await fetch(`${API_URL}/bookings/${bookingId}/check-in`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || "Check-in failed");

            setBookings((prev) =>
                prev.map((b) => (b.id === bookingId ? { ...b, ...data } : b))
            );
            setMessage(`Successfully checked into Booking #${bookingId}! Enjoy your workspace.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setTrackingId(null);
        }
    };

    const handleCheckOut = async (bookingId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setTrackingId(bookingId);
        setError("");
        setMessage("");

        try {
            const res = await fetch(`${API_URL}/bookings/${bookingId}/check-out`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || "Check-out failed");

            setBookings((prev) =>
                prev.map((b) => (b.id === bookingId ? { ...b, ...data } : b))
            );
            setMessage(`Successfully checked out of Booking #${bookingId}. Have a great day!`);
        } catch (err) {
            setError(err.message);
        } finally {
            setTrackingId(null);
        }
    };

    const handleViewInvoice = async (bookingId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/invoices/booking/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Invoice could not be retrieved");
            const inv = await res.json();
            setSelectedInvoice(inv);
        } catch (err) {
            alert(err.message || "Failed to load invoice");
        }
    };

    const cancelBooking = async (bookingId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );
        if (!confirmed) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please log in again.");
            return;
        }

        setError("");
        setMessage("");
        setCancellingId(bookingId);

        try {
            const response = await fetch(
                `${API_URL}/bookings/${bookingId}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message || data?.detail || "Unable to cancel this booking."
                );
            }

            setBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    booking.id === bookingId ? { ...booking, ...data } : booking
                )
            );

            setMessage(`Booking #${bookingId} cancelled successfully.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setCancellingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTimestamp = (ts) => {
        if (!ts) return "—";
        return new Date(ts).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        });
    };

    return (
        <main className="app">
            <nav className="navbar">
                <Link className="brand" to="/">
                    <span className="brand-icon">w.</span>
                    worknest
                </Link>

                <div className="nav-links">
                    <Link to="/my-bookings" style={{ color: "#314b39", fontWeight: 700 }}>My Bookings</Link>
                    <Link to="/invoices">Invoices</Link>
                    <Link to="/profile">Member Profile</Link>
                </div>

                <Link className="nav-cta" to="/">
                    ← Explore spaces
                </Link>
            </nav>

            <section className="spaces-section my-bookings-section">
                <div className="eyebrow">MEMBER DASHBOARD</div>
                <h1>My Bookings & Check-In Tracking.</h1>
                <p>Manage your reservations, view seat details, check-in upon arrival, and generate invoices.</p>

                {!loading && !error && (
                    <div className="booking-stats">
                        <div className="booking-stat">
                            <span>Total Reservations</span>
                            <strong>{bookings.length}</strong>
                        </div>
                        <div className="booking-stat">
                            <span>Confirmed</span>
                            <strong>{bookings.filter((b) => b.status === "CONFIRMED").length}</strong>
                        </div>
                        <div className="booking-stat">
                            <span>Currently Checked-In</span>
                            <strong style={{ color: "#2e7d32" }}>
                                {bookings.filter((b) => b.checkInStatus === "CHECKED_IN").length}
                            </strong>
                        </div>
                    </div>
                )}

                {loading && <p className="message">Loading your bookings...</p>}
                {error && <div className="message error">{error}</div>}
                {message && <p className="message">{message}</p>}

                {!loading && !error && bookings.length === 0 && (
                    <div className="empty-bookings">
                        <div className="empty-bookings-icon">w.</div>
                        <h2>No bookings yet</h2>
                        <p>Your next productive workday starts with finding the right workspace.</p>
                        <Link className="book-button booking-link" to="/">
                            Explore workspaces →
                        </Link>
                    </div>
                )}

                {!loading && bookings.length > 0 && (
                    <div className="my-bookings-list">
                        {bookings.map((booking) => (
                            <article className="my-booking-card" key={booking.id}>
                                <div className="my-booking-top">
                                    <div>
                                        <span className="field-label">BOOKING #{booking.id}</span>
                                        <h2>{booking.spaceName}</h2>
                                        <p className="space-location">⌖ {booking.location}</p>
                                    </div>

                                    <div className="booking-status-badges">
                                        <span
                                            className={
                                                booking.status === "CONFIRMED"
                                                    ? "booking-status confirmed"
                                                    : booking.status === "COMPLETED"
                                                        ? "booking-status completed"
                                                        : "booking-status cancelled"
                                            }
                                        >
                                            {booking.status}
                                        </span>

                                        <span
                                            className={`checkin-badge ${booking.checkInStatus?.toLowerCase() || "not_checked_in"}`}
                                        >
                                            {booking.checkInStatus === "CHECKED_IN"
                                                ? "🟢 Checked In"
                                                : booking.checkInStatus === "CHECKED_OUT"
                                                    ? "⚪ Checked Out"
                                                    : "⏳ Not Checked In"}
                                        </span>
                                    </div>
                                </div>

                                <div className="my-booking-details">
                                    <div>
                                        <span className="field-label">ASSIGNED SEAT / CABIN</span>
                                        <strong style={{ color: "#314b39" }}>
                                            {booking.deskCode ? `${booking.deskCode} (${booking.deskType})` : "General Flex Desk"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="field-label">PASS TYPE</span>
                                        <strong>
                                            {booking.bookingType === "DAILY" ? "Daily Pass" : "Monthly Pass"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="field-label">RESERVATION DATES</span>
                                        <strong>
                                            {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="field-label">CHECK-IN / OUT TIMESTAMPS</span>
                                        <div className="timestamp-tracker">
                                            <span>In: {booking.checkedInAt ? formatTimestamp(booking.checkedInAt) : "—"}</span>
                                            <span>Out: {booking.checkedOutAt ? formatTimestamp(booking.checkedOutAt) : "—"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="field-label">TOTAL PAID</span>
                                        <strong className="booking-total">
                                            {formatPrice(booking.totalPrice)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="my-booking-footer">
                                    <div className="booking-actions-left">
                                        <button
                                            className="invoice-download-btn"
                                            onClick={() => handleViewInvoice(booking.id)}
                                        >
                                            📄 View Tax Invoice
                                        </button>
                                    </div>

                                    <div className="booking-actions-right">
                                        {booking.status === "CONFIRMED" && (
                                            <>
                                                {booking.checkInStatus !== "CHECKED_IN" && booking.checkInStatus !== "CHECKED_OUT" && (
                                                    <button
                                                        className="checkin-action-btn check-in"
                                                        onClick={() => handleCheckIn(booking.id)}
                                                        disabled={trackingId === booking.id}
                                                    >
                                                        {trackingId === booking.id ? "Processing..." : "📍 Check-in Now"}
                                                    </button>
                                                )}

                                                {booking.checkInStatus === "CHECKED_IN" && (
                                                    <button
                                                        className="checkin-action-btn check-out"
                                                        onClick={() => handleCheckOut(booking.id)}
                                                        disabled={trackingId === booking.id}
                                                    >
                                                        {trackingId === booking.id ? "Processing..." : "🚪 Check-out"}
                                                    </button>
                                                )}

                                                {booking.checkInStatus !== "CHECKED_IN" && booking.checkInStatus !== "CHECKED_OUT" && (
                                                    <button
                                                        className="cancel-booking-button"
                                                        onClick={() => cancelBooking(booking.id)}
                                                        disabled={cancellingId === booking.id}
                                                    >
                                                        {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
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

export default MyBookings;
