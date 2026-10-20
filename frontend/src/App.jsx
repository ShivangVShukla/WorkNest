
import { useEffect, useState } from "react";
import "./App.css";
import {
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import MyBookings from "./pages/MyBookings";
import BookingPage from "./pages/BookingPage";

const API_URL = "http://localhost:8080/api/spaces";

function HomePage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [spaceType, setSpaceType] = useState("ALL");
  const [loggedIn, setLoggedIn] = useState(
      Boolean(localStorage.getItem("token"))
  );

  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Unable to load workspaces");
          }
          return response.json();
        })
        .then((data) => {
          setSpaces(data);
          setError("");
        })
        .catch(() => {
          setError(
              "Could not connect to the server. Make sure Spring Boot is running."
          );
        })
        .finally(() => setLoading(false));
  }, []);

  const filteredSpaces =
      spaceType === "ALL"
          ? spaces
          : spaces.filter(
              (space) => space.spaceType?.toUpperCase() === spaceType
          );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    navigate("/");
  };

  return (
      <main className="app">
        <nav className="navbar">
          <Link className="brand" to="/">
            <span className="brand-icon">w.</span>
            worknest
          </Link>

          <div className="nav-links">
            <a href="#spaces">Explore spaces</a>
            <a href="#how-it-works">How it works</a>
          </div>

          <div className="nav-links">
            {loggedIn ? (
                <>
                  <Link to="/my-bookings">My Bookings</Link>
                  <button
                      type="button"
                      className="nav-cta"
                      onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
            ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link className="nav-cta" to="/register">
                    Get started ↗
                  </Link>
                </>
            )}
          </div>
        </nav>

        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot"></span>
              YOUR NEXT GREAT WORKDAY STARTS HERE
            </div>

            <h1>
              Space to work.
              <br />
              <span>Room to grow.</span>
            </h1>

            <p>
              Find a workspace that fits your day. From focused desks to
              private cabins, your next productive day starts here.
            </p>

            <a className="primary-button" href="#spaces">
              Explore workspaces <span>→</span>
            </a>

            <div className="hero-note">
              <span>✳</span> Flexible plans. Better workdays.
            </div>
          </div>

          <div className="hero-visual">
            <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85"
                alt="Bright, modern coworking workspace"
            />

            <div className="floating-card">
              <span className="floating-icon">✳</span>
              <div>
                <strong>Your space, your pace.</strong>
                <p>Book by the day or month</p>
              </div>
            </div>

            <div className="image-caption">
              MAKE ROOM FOR YOUR BEST WORK
            </div>
          </div>
        </section>

        <section className="spaces-section" id="spaces">
          <div className="section-heading">
            <div>
              <div className="eyebrow">FIND YOUR FLOW</div>
              <h2>Spaces that work for you.</h2>
              <p>Explore workspaces available in your network.</p>
            </div>

            <div className="filters" aria-label="Filter workspace types">
              {["ALL", "DESK", "CABIN", "MEETING_ROOM"].map((type) => (
                  <button
                      key={type}
                      className={
                        spaceType === type ? "filter active" : "filter"
                      }
                      onClick={() => setSpaceType(type)}
                  >
                    {type === "ALL" ? "All spaces" : type.replace("_", " ")}
                  </button>
              ))}
            </div>
          </div>

          {loading && (
              <p className="message">Finding your workspace...</p>
          )}

          {error && <p className="message error">{error}</p>}

          {!loading && !error && filteredSpaces.length === 0 && (
              <div className="empty-state">
                <span>⌕</span>
                <h3>No spaces found</h3>
                <p>
                  Try another workspace category or check back later.
                </p>
              </div>
          )}

          <div className="space-grid">
            {filteredSpaces.map((space) => (
                <article className="space-card" key={space.id}>
                  <div className="space-card-top">
                <span className="type-tag">
                  {space.spaceType?.replace("_", " ") || "WORKSPACE"}
                </span>

                    <span
                        className={
                          space.active ? "availability" : "unavailable"
                        }
                    >
                  {space.active ? "● Available" : "● Unavailable"}
                </span>
                  </div>

                  <div className="space-card-body">
                    <div className="space-location">
                      ⌖ {space.location}
                    </div>

                    <h3>{space.name}</h3>

                    <p className="space-description">
                      {space.description ||
                          "A comfortable place to get your best work done."}
                    </p>

                    <div className="price-row">
                      <div>
                        <strong>
                          ₹
                          {Number(space.pricePerDay || 0).toLocaleString(
                              "en-IN"
                          )}
                        </strong>
                        <span> / day</span>
                      </div>

                      <div className="monthly-price">
                        ₹
                        {Number(space.pricePerMonth || 0).toLocaleString(
                            "en-IN"
                        )}{" "}
                        / month
                      </div>
                    </div>

                    <button
                        className="book-button"
                        disabled={!space.active}
                        onClick={() =>
                            navigate(`/booking?spaceId=${space.id}`)
                        }
                    >
                      {space.active
                          ? "Book this space →"
                          : "Currently unavailable"}
                    </button>
                  </div>
                </article>
            ))}
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="eyebrow">SIMPLE BY DESIGN</div>
          <h2>Your workspace in three steps.</h2>

          <div className="steps-grid">
            <div className="step">
              <span>01</span>
              <h3>Find your fit</h3>
              <p>Explore desks and cabins that match your work style.</p>
            </div>

            <div className="step">
              <span>02</span>
              <h3>Pick your dates</h3>
              <p>Choose the dates and plan that work for you.</p>
            </div>

            <div className="step">
              <span>03</span>
              <h3>Get to work</h3>
              <p>Confirm your booking and get ready for a productive day.</p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <Link className="brand" to="/">
            <span className="brand-icon">w.</span>
            worknest
          </Link>
          <p>Make space for great work.</p>
        </footer>
      </main>
  );
}

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
  );
}

export default App;
