
import { useEffect, useState } from "react";
import {
    Link,
    Navigate,
    useLocation,
    useSearchParams,
} from "react-router-dom";
import "../App.css";

const API_URL = "http://localhost:8080/api";

function getLocalDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function BookingPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const spaceId = searchParams.get("spaceId");

    const [space, setSpace] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [plan, setPlan] = useState("DAY");
    const [available, setAvailable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [booking, setBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const today = getLocalDate();

    useEffect(() => {
        if (!spaceId) {
            setError("No workspace selected. Please select a workspace first.");
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/spaces`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Unable to load workspaces.");
                }
                return response.json();
            })
            .then((spaces) => {
                const selectedSpace = spaces.find(
                    (item) => String(item.id) === String(spaceId)
                );

                if (!selectedSpace) {
                    throw new Error("Workspace not found.");
                }

                setSpace(selectedSpace);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [spaceId]);

    const calculateDays = () => {
        if (!startDate || !endDate || endDate <= startDate) {
            return 0;
        }

        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T00:00:00`);

        return Math.round(
            (end - start) / (1000 * 60 * 60 * 24)
        );
    };

    const calculatePrice = () => {
        if (!space) {
            return 0;
        }

        const days = calculateDays();

        if (days <= 0) {
            return 0;
        }

        if (plan === "DAY") {
            return days * Number(space.pricePerDay || 0);
        }

        return Math.max(1, Math.ceil(days / 30))
            * Number(space.pricePerMonth || 0);
    };

    const resetBookingState = () => {
        setAvailable(null);
        setBookingResult(null);
        setError("");
        setMessage("");
    };

    const checkAvailability = async () => {
        setError("");
        setMessage("");
        setAvailable(null);
        setBookingResult(null);

        if (!startDate || !endDate) {
            setError("Please select both start and end dates.");
            return;
        }

        if (startDate < today || endDate <= startDate) {
            setError("Select valid dates. Check-out must be after check-in.");
            return;
        }

        setChecking(true);

        try {
            const params = new URLSearchParams({
                startDate,
                endDate,
            });

            const response = await fetch(
                `${API_URL}/spaces/availability?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error("Could not check availability. Please try again.");
            }

            const spaces = await response.json();

            const isAvailable = spaces.some(
                (item) => String(item.id) === String(spaceId)
            );

            setAvailable(isAvailable);

            if (isAvailable) {
                setMessage("Great! This workspace is available for your dates.");
            } else {
                setMessage("This workspace is not available for those dates.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setChecking(false);
        }
    };

    const confirmBooking = async () => {
        setError("");
        setMessage("");

        if (available !== true) {
            setError("Please check availability first.");
            return;
        }

        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            return;
        }

        setBooking(true);

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
                body: JSON.stringify({
                    spaceId: Number(spaceId),
                    bookingType: plan === "DAY" ? "DAILY" : "MONTHLY",
                    startDate,
                    endDate,
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.detail ||
                    (response.status === 401
                        ? "Your session may have expired. Please log in again."
                        : "Booking failed. Please try again.")
                );
            }

            setBookingResult(data);
            setAvailable(null);
            setMessage("Your workspace has been booked successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setBooking(false);
        }
    };

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: `${location.pathname}${location.search}`,
                }}
            />
        );
    }

    if (loading) {
        return (
            <main className="app">
                <p className="message">Loading workspace...</p>
            </main>
        );
    }

    if (error && !space) {
        return (
            <main className="app">
                <p className="message error">{error}</p>
                <Link to="/">← Back to workspaces</Link>
            </main>
        );
    }

    if (!space) {
        return (
            <main className="app">
                <p className="message">Workspace not found.</p>
                <Link to="/">← Back to workspaces</Link>
            </main>
        );
    }

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

            <section className="spaces-section">
                <div className="eyebrow">MAKE IT YOUR WORKDAY</div>
                <h1>Book your workspace.</h1>
                <p>Find your space, choose your dates, and make it yours.</p>

                <div className="space-grid">
                    <article className="space-card">
                        <div className="workspace-visual">
                            <span className="workspace-visual-label">
                                WORKNEST / YOUR NEXT WORKDAY
                            </span>
                            <div className="workspace-visual-icon">w.</div>
                            <div className="workspace-visual-bottom">
                                <span>YOUR SPACE.</span>
                                <span>YOUR PACE.</span>
                            </div>
                        </div>

                        <div className="space-card-top">
                            <span className="type-tag">
                                {space.spaceType?.replace("_", " ") || "WORKSPACE"}
                            </span>
                            <span className={space.active ? "availability" : "unavailable"}>
                                {space.active ? "● Active" : "● Inactive"}
                            </span>
                        </div>

                        <div className="space-card-body">
                            <div className="space-location">⌖ {space.location}</div>
                            <h2>{space.name}</h2>

                            <p className="space-description">
                                {space.description ||
                                    "A comfortable place to focus, collaborate, and get your best work done."}
                            </p>

                            <div className="workspace-divider" />

                            <div className="workspace-prices">
                                <div>
                                    <span className="field-label">DAILY PASS</span>
                                    <strong>
                                        ₹{Number(space.pricePerDay || 0).toLocaleString("en-IN")}
                                    </strong>
                                    <span className="workspace-price-unit">per day</span>
                                </div>

                                <div>
                                    <span className="field-label">MONTHLY PASS</span>
                                    <strong>
                                        ₹{Number(space.pricePerMonth || 0).toLocaleString("en-IN")}
                                    </strong>
                                    <span className="workspace-price-unit">per month</span>
                                </div>
                            </div>

                            <div className="workspace-summary">
                                <span className="field-label">YOUR BOOKING SUMMARY</span>

                                <div className="summary-row">
                                    <span>Selected plan</span>
                                    <strong>{plan === "DAY" ? "Daily pass" : "Monthly pass"}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Check-in</span>
                                    <strong>{startDate || "Not selected"}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Check-out</span>
                                    <strong>{endDate || "Not selected"}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Duration</span>
                                    <strong>
                                        {calculateDays() > 0
                                            ? `${calculateDays()} day${calculateDays() === 1 ? "" : "s"}`
                                            : "—"}
                                    </strong>
                                </div>

                                <div className="summary-row summary-total">
                                    <span>Estimated total</span>
                                    <strong>
                                        ₹{calculatePrice().toLocaleString("en-IN")}
                                    </strong>
                                </div>
                            </div>

                            <p className="workspace-footnote">
                                Final booking price is calculated and validated by the server.
                            </p>
                        </div>
                    </article>

                    <article className="space-card">
                        <div className="space-card-body">
                            <h2>Booking details</h2>
                            <p className="space-description">
                                Select a pass and your preferred dates.
                            </p>

                            <div className="booking-field">
                                <label className="field-label">CHOOSE YOUR PLAN</label>

                                <div className="plan-options">
                                    <button
                                        type="button"
                                        className={plan === "DAY" ? "plan-option selected" : "plan-option"}
                                        onClick={() => {
                                            setPlan("DAY");
                                            resetBookingState();
                                        }}
                                    >
                                        <span className="plan-name">Daily pass</span>
                                        <strong>
                                            ₹{Number(space.pricePerDay || 0).toLocaleString("en-IN")}
                                        </strong>
                                        <span className="plan-caption">Flexible, pay per day</span>
                                    </button>

                                    <button
                                        type="button"
                                        className={plan === "MONTH" ? "plan-option selected" : "plan-option"}
                                        onClick={() => {
                                            setPlan("MONTH");
                                            resetBookingState();
                                        }}
                                    >
                                        <span className="plan-name">Monthly pass</span>
                                        <strong>
                                            ₹{Number(space.pricePerMonth || 0).toLocaleString("en-IN")}
                                        </strong>
                                        <span className="plan-caption">For longer stays</span>
                                    </button>
                                </div>
                            </div>

                            <div className="booking-field">
                                <label className="field-label" htmlFor="startDate">
                                    CHECK-IN
                                </label>
                                <input
                                    className="date-input"
                                    id="startDate"
                                    type="date"
                                    min={today}
                                    value={startDate}
                                    onChange={(event) => {
                                        setStartDate(event.target.value);
                                        resetBookingState();
                                    }}
                                />
                            </div>

                            <div className="booking-field">
                                <label className="field-label" htmlFor="endDate">
                                    CHECK-OUT
                                </label>
                                <input
                                    className="date-input"
                                    id="endDate"
                                    type="date"
                                    min={startDate || today}
                                    value={endDate}
                                    onChange={(event) => {
                                        setEndDate(event.target.value);
                                        resetBookingState();
                                    }}
                                />
                            </div>

                            <div className="price-row">
                                <strong>Estimated total</strong>
                                <strong>
                                    ₹{calculatePrice().toLocaleString("en-IN")}
                                </strong>
                            </div>

                            <p className="space-description">
                                {plan === "DAY"
                                    ? "Daily rate × number of days."
                                    : "Monthly rate × 30-day periods, rounded up for this estimate."}
                            </p>

                            {error && <p className="message error">{error}</p>}
                            {message && <p className="message">{message}</p>}

                            {!bookingResult && (
                                <button
                                    className="book-button"
                                    onClick={checkAvailability}
                                    disabled={checking || booking || !space.active}
                                >
                                    {checking ? "Checking..." : "Check availability →"}
                                </button>
                            )}

                            {available === true && !bookingResult && (
                                <button
                                    className="book-button confirm-booking-button"
                                    onClick={confirmBooking}
                                    disabled={booking}
                                >
                                    {booking ? "Confirming..." : "Confirm booking →"}
                                </button>
                            )}

                            {bookingResult && (
                                <div className="booking-success">
                                    <strong>Booking confirmed!</strong>
                                    <p>Your reservation has been saved successfully.</p>

                                    {bookingResult.id != null && (
                                        <p>
                                            Booking ID: <strong>{bookingResult.id}</strong>
                                        </p>
                                    )}

                                    {bookingResult.totalPrice != null && (
                                        <p>
                                            Total: ₹
                                            {Number(bookingResult.totalPrice).toLocaleString("en-IN")}
                                        </p>
                                    )}

                                    <Link className="book-button booking-link" to="/my-bookings">
                                        View my bookings →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </article>
                </div>
            </section>
        </main>
    );
}

export default BookingPage;
