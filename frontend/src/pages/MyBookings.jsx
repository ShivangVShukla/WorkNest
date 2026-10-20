
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const API_URL = "http://localhost:8080/api";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [message, setMessage] = useState("");

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
                    data?.message ||
                    data?.detail ||
                    "Unable to load your bookings."
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

    const cancelBooking = async (bookingId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmed) {
            return;
        }

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
                    data?.message ||
                    data?.detail ||
                    "Unable to cancel this booking."
                );
            }

            setBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    booking.id === bookingId
                        ? { ...booking, ...data }
                        : booking
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
        if (!date) {
            return "—";
        }

        return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        });
    };

    const confirmedCount = bookings.filter(
        (booking) => booking.status === "CONFIRMED"
    ).length;

    const cancelledCount = bookings.filter(
        (booking) => booking.status === "CANCELLED"
    ).length;

    return (
        <main className="app">
            <nav className="navbar">
                <Link className="brand" to="/">
                    <span className="brand-icon">w.</span>
                    worknest
                </Link>

                <Link className="nav-cta" to="/">
                    ← Explore spaces
                </Link>
            </nav>

            <section className="spaces-section my-bookings-section">
                <div className="eyebrow">YOUR WORKNEST ACCOUNT</div>
                <h1>My bookings.</h1>
                <p>All your workspace reservations, together in one place.</p>

                {!loading && !error && (
                    <div className="booking-stats">
                        <div className="booking-stat">
                            <span>Total bookings</span>
                            <strong>{bookings.length}</strong>
                        </div>

                        <div className="booking-stat">
                            <span>Confirmed</span>
                            <strong>{confirmedCount}</strong>
                        </div>

                        <div className="booking-stat">
                            <span>Cancelled</span>
                            <strong>{cancelledCount}</strong>
                        </div>
                    </div>
                )}

                {loading && (
                    <p className="message">Loading your bookings...</p>
                )}

                {error && (
                    <div className="message error">
                        {error}
                        <button
                            className="retry-button"
                            onClick={loadBookings}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {message && (
                    <p className="message">{message}</p>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <div className="empty-bookings">
                        <div className="empty-bookings-icon">w.</div>
                        <h2>No bookings yet</h2>
                        <p>
                            Your next productive workday starts with finding
                            the right workspace.
                        </p>
                        <Link className="book-button booking-link" to="/">
                            Explore workspaces →
                        </Link>
                    </div>
                )}

                {!loading && bookings.length > 0 && (
                    <div className="my-bookings-list">
                        {bookings.map((booking) => (
                            <article
                                className="my-booking-card"
                                key={booking.id}
                            >
                                <div className="my-booking-top">
                                    <div>
                                        <span className="field-label">
                                            BOOKING #{booking.id}
                                        </span>
                                        <h2>{booking.spaceName}</h2>
                                        <p className="space-location">
                                            ⌖ {booking.location}
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            booking.status === "CONFIRMED"
                                                ? "booking-status confirmed"
                                                : "booking-status cancelled"
                                        }
                                    >
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="my-booking-details">
                                    <div>
                                        <span className="field-label">
                                            PLAN
                                        </span>
                                        <strong>
                                            {booking.bookingType === "DAILY"
                                                ? "Daily pass"
                                                : "Monthly pass"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="field-label">
                                            CHECK-IN
                                        </span>
                                        <strong>
                                            {formatDate(booking.startDate)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="field-label">
                                            CHECK-OUT
                                        </span>
                                        <strong>
                                            {formatDate(booking.endDate)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="field-label">
                                            TOTAL PRICE
                                        </span>
                                        <strong className="booking-total">
                                            {formatPrice(booking.totalPrice)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="my-booking-footer">
                                    <span>
                                        {booking.spaceType || "Workspace"}
                                    </span>

                                    {booking.status === "CONFIRMED" && (
                                        <button
                                            className="cancel-booking-button"
                                            onClick={() =>
                                                cancelBooking(booking.id)
                                            }
                                            disabled={
                                                cancellingId === booking.id
                                            }
                                        >
                                            {cancellingId === booking.id
                                                ? "Cancelling..."
                                                : "Cancel booking"}
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default MyBookings;
