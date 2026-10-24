import { useEffect, useState } from "react";
import {
    Link,
    Navigate,
    useLocation,
    useSearchParams,
} from "react-router-dom";
import "../App.css";
import SeatMap from "../components/SeatMap";
import InvoiceModal from "../components/InvoiceModal";

const API_URL = "http://localhost:8080/api";

function getLocalDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getInitialCheckoutDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function BookingPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const spaceId = searchParams.get("spaceId");

    const [space, setSpace] = useState(null);
    const [startDate, setStartDate] = useState(getLocalDate());
    const [endDate, setEndDate] = useState(getInitialCheckoutDate());
    const [plan, setPlan] = useState("DAY");
    const [selectedDesk, setSelectedDesk] = useState(null);
    const [seatMapDesks, setSeatMapDesks] = useState([]);
    const [loadingSeatMap, setLoadingSeatMap] = useState(false);
    const [available, setAvailable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [booking, setBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
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

    // Fetch Seat Map availability dynamically
    useEffect(() => {
        if (!spaceId || !startDate || !endDate || endDate <= startDate) {
            return;
        }

        setLoadingSeatMap(true);
        const params = new URLSearchParams({ startDate, endDate });

        fetch(`${API_URL}/bookings/spaces/${spaceId}/seat-map?${params.toString()}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch seat map");
                return res.json();
            })
            .then((data) => {
                setSeatMapDesks(Array.isArray(data) ? data : []);
                // If previously selected desk is now booked, reset selection
                if (selectedDesk) {
                    const matched = data.find((d) => d.id === selectedDesk.id);
                    if (!matched || !matched.available) {
                        setSelectedDesk(null);
                    }
                }
            })
            .catch(() => {
                // If seat-map endpoint failed (e.g. backend offline or fallback), provide virtual layout
                generateVirtualSeatMap();
            })
            .finally(() => setLoadingSeatMap(false));
    }, [spaceId, startDate, endDate]);

    const generateVirtualSeatMap = () => {
        const virtual = [];
        for (let r = 1; r <= 3; r++) {
            for (let c = 1; c <= 4; c++) {
                const isCabin = r === 3;
                virtual.push({
                    id: r * 10 + c,
                    deskCode: isCabin ? `C-${r}${c}` : `D-${r}${c}`,
                    deskType: isCabin ? "CABIN" : "DESK",
                    rowNumber: r,
                    colNumber: c,
                    capacity: isCabin ? 4 : 1,
                    available: true,
                    active: true,
                });
            }
        }
        setSeatMapDesks(virtual);
    };

    const calculateDays = () => {
        if (!startDate || !endDate || endDate <= startDate) {
            return 0;
        }

        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T00:00:00`);

        return Math.round((end - start) / (1000 * 60 * 60 * 24));
    };

    const calculatePrice = () => {
        if (!space) return 0;
        const days = calculateDays();
        if (days <= 0) return 0;

        let multiplier = 1.0;
        if (selectedDesk && selectedDesk.deskType === "CABIN") {
            multiplier = 1.5;
        }

        if (plan === "DAY") {
            return Math.round(days * Number(space.pricePerDay || 0) * multiplier);
        }

        return Math.round(
            Math.max(1, Math.ceil(days / 30)) * Number(space.pricePerMonth || 0) * multiplier
        );
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
                setMessage("Great! This workspace has seats available for your dates. Select your desk on the map below.");
            } else {
                setMessage("This workspace is fully booked for those dates.");
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

        const currentToken = localStorage.getItem("token");
        if (!currentToken) {
            setError("Please log in to complete your booking.");
            return;
        }

        setBooking(true);

        try {
            const payload = {
                spaceId: Number(spaceId),
                deskId: selectedDesk ? Number(selectedDesk.id) : null,
                bookingType: plan === "DAY" ? "DAILY" : "MONTHLY",
                startDate,
                endDate,
            };

            const response = await fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.detail ||
                    "Booking failed. Please try again."
                );
            }

            setBookingResult(data);
            setAvailable(null);
            setMessage("Your workspace and seat have been reserved successfully!");

            // Fetch invoice automatically
            if (data?.id) {
                fetch(`${API_URL}/invoices/booking/${data.id}`, {
                    headers: { Authorization: `Bearer ${currentToken}` },
                })
                    .then((r) => (r.ok ? r.json() : null))
                    .then((inv) => {
                        if (inv) setInvoiceData(inv);
                    })
                    .catch(() => { });
            }
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
                state={{ from: `${location.pathname}${location.search}` }}
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

                <div className="nav-links">
                    <Link to="/my-bookings">My Bookings</Link>
                    <Link to="/invoices">Invoices</Link>
                    <Link to="/profile">Member Profile</Link>
                </div>

                <Link className="nav-cta" to="/">
                    ← Back to spaces
                </Link>
            </nav>

            <section className="booking-page-section">
                <div className="booking-page-heading">
                    <div className="eyebrow">CO-WORKING & CABIN RESERVATION</div>
                    <h1>Reserve your desk or cabin.</h1>
                    <p>Select your dates, inspect real-time seat availability, and lock in your pass.</p>
                </div>

                <div className="booking-layout-grid">
                    <article className="space-card">
                        <div className="space-card-body">
                            <span className="type-tag">{space.spaceType}</span>
                            <div className="space-location">⌖ {space.location}</div>
                            <h2>{space.name}</h2>
                            <p className="space-description">
                                {space.description || "A premier workspace curated for productivity and focus."}
                            </p>

                            <div className="workspace-divider" />

                            <div className="workspace-prices">
                                <div>
                                    <span className="field-label">DAILY PASS</span>
                                    <strong>₹{Number(space.pricePerDay || 0).toLocaleString("en-IN")}</strong>
                                    <span className="workspace-price-unit">per day</span>
                                </div>
                                <div>
                                    <span className="field-label">MONTHLY PASS</span>
                                    <strong>₹{Number(space.pricePerMonth || 0).toLocaleString("en-IN")}</strong>
                                    <span className="workspace-price-unit">per month</span>
                                </div>
                            </div>

                            <div className="workspace-summary">
                                <span className="field-label">BOOKING OVERVIEW</span>

                                <div className="summary-row">
                                    <span>Selected Pass:</span>
                                    <strong>{plan === "DAY" ? "Daily Pass" : "Monthly Membership"}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Selected Seat/Cabin:</span>
                                    <strong style={{ color: "#314b39" }}>
                                        {selectedDesk ? `${selectedDesk.deskCode} (${selectedDesk.deskType})` : "Any available desk"}
                                    </strong>
                                </div>

                                <div className="summary-row">
                                    <span>Check-in:</span>
                                    <strong>{startDate}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Check-out:</span>
                                    <strong>{endDate}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Duration:</span>
                                    <strong>{calculateDays()} day(s)</strong>
                                </div>

                                <div className="summary-row summary-total">
                                    <span>Estimated Total:</span>
                                    <strong>₹{calculatePrice().toLocaleString("en-IN")}</strong>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className="space-card">
                        <div className="space-card-body">
                            <h2>Choose Dates & Plan</h2>
                            <div className="booking-field">
                                <label className="field-label">CHOOSE YOUR PASS</label>
                                <div className="plan-options">
                                    <button
                                        type="button"
                                        className={plan === "DAY" ? "plan-option selected" : "plan-option"}
                                        onClick={() => {
                                            setPlan("DAY");
                                            resetBookingState();
                                        }}
                                    >
                                        <span className="plan-name">Daily Pass</span>
                                        <strong>₹{Number(space.pricePerDay || 0).toLocaleString("en-IN")}</strong>
                                        <span className="plan-caption">Flexible single or multi-day</span>
                                    </button>

                                    <button
                                        type="button"
                                        className={plan === "MONTH" ? "plan-option selected" : "plan-option"}
                                        onClick={() => {
                                            setPlan("MONTH");
                                            resetBookingState();
                                        }}
                                    >
                                        <span className="plan-name">Monthly Pass</span>
                                        <strong>₹{Number(space.pricePerMonth || 0).toLocaleString("en-IN")}</strong>
                                        <span className="plan-caption">Full 30-day membership</span>
                                    </button>
                                </div>
                            </div>

                            <div className="date-selection-row">
                                <div className="booking-field">
                                    <label className="field-label" htmlFor="startDate">CHECK-IN DATE</label>
                                    <input
                                        className="date-input"
                                        id="startDate"
                                        type="date"
                                        min={today}
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            resetBookingState();
                                        }}
                                    />
                                </div>

                                <div className="booking-field">
                                    <label className="field-label" htmlFor="endDate">CHECK-OUT DATE</label>
                                    <input
                                        className="date-input"
                                        id="endDate"
                                        type="date"
                                        min={startDate || today}
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            resetBookingState();
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Real-time Seat-Map Interactive Component */}
                            <SeatMap
                                desks={seatMapDesks}
                                selectedDeskId={selectedDesk?.id}
                                onSelectDesk={(desk) => {
                                    setSelectedDesk(desk);
                                    setMessage(`Selected ${desk.deskCode} (${desk.deskType})`);
                                    setAvailable(true);
                                }}
                                baseDayPrice={space.pricePerDay}
                                baseMonthPrice={space.pricePerMonth}
                                plan={plan}
                            />

                            {error && <p className="message error">{error}</p>}
                            {message && <p className="message">{message}</p>}

                            {!bookingResult && (
                                <div className="booking-action-buttons">
                                    <button
                                        className="book-button"
                                        onClick={checkAvailability}
                                        disabled={checking || booking}
                                    >
                                        {checking ? "Checking availability..." : "Verify Availability"}
                                    </button>

                                    <button
                                        className="book-button confirm-booking-button"
                                        onClick={confirmBooking}
                                        disabled={booking}
                                    >
                                        {booking ? "Confirming..." : "Confirm & Book Now →"}
                                    </button>
                                </div>
                            )}

                            {bookingResult && (
                                <div className="booking-success">
                                    <strong>🎉 Booking Confirmed!</strong>
                                    <p>Reservation ID: <strong>#{bookingResult.id}</strong></p>
                                    <p>Seat Assigned: <strong>{bookingResult.deskCode || (selectedDesk ? selectedDesk.deskCode : "Open Flex")}</strong></p>
                                    <p>Total Paid: <strong>₹{Number(bookingResult.totalPrice).toLocaleString("en-IN")}</strong></p>

                                    <div className="success-action-row">
                                        {invoiceData && (
                                            <button
                                                className="invoice-view-btn"
                                                onClick={() => setShowInvoiceModal(true)}
                                            >
                                                📄 View Tax Invoice
                                            </button>
                                        )}
                                        <Link className="book-button booking-link" to="/my-bookings">
                                            Go to My Bookings & Check-in →
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                </div>
            </section>

            {showInvoiceModal && invoiceData && (
                <InvoiceModal
                    invoice={invoiceData}
                    onClose={() => setShowInvoiceModal(false)}
                />
            )}
        </main>
    );
}

export default BookingPage;
