import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

function AppNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(
        () => localStorage.getItem("worknest-theme") === "dark" ? "dark" : "light"
    );
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => Boolean(localStorage.getItem("token"))
    );
    const [openMenuPath, setOpenMenuPath] = useState(null);
    const menuOpen = openMenuPath === location.pathname;

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("worknest-theme", theme);
    }, [theme]);

    useEffect(() => {
        const syncAuthentication = () => {
            setIsAuthenticated(Boolean(localStorage.getItem("token")));
        };
        window.addEventListener("worknest-auth-change", syncAuthentication);
        window.addEventListener("storage", syncAuthentication);
        return () => {
            window.removeEventListener("worknest-auth-change", syncAuthentication);
            window.removeEventListener("storage", syncAuthentication);
        };
    }, []);

    const closeMenu = () => setOpenMenuPath(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        closeMenu();
        navigate("/");
    };

    return (
        <header className="navbar">
            <Link className="brand" to="/" onClick={closeMenu}>
                <span className="brand-icon">w.</span>
                worknest
            </Link>

            <button
                type="button"
                className="navbar-menu-toggle"
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                aria-controls="primary-navigation"
                onClick={() => setOpenMenuPath(menuOpen ? null : location.pathname)}
            >
                <span />
                <span />
                <span />
            </button>

            <div
                id="primary-navigation"
                className={`navbar-content${menuOpen ? " is-open" : ""}`}
            >
                <nav className="nav-links" aria-label="Main navigation">
                    <Link to="/#spaces" onClick={closeMenu}>Explore spaces</Link>
                    <Link to="/#how-it-works" onClick={closeMenu}>How it works</Link>
                    {isAuthenticated && (
                        <>
                            <NavLink
                                to="/my-bookings"
                                className={({ isActive }) => isActive ? "active" : ""}
                                onClick={closeMenu}
                            >
                                My Bookings
                            </NavLink>
                            <NavLink
                                to="/invoices"
                                className={({ isActive }) => isActive ? "active" : ""}
                                onClick={closeMenu}
                            >
                                Invoices
                            </NavLink>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) => isActive ? "active" : ""}
                                onClick={closeMenu}
                            >
                                Member Profile
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="navbar-actions">
                    <button
                        type="button"
                        className="theme-toggle"
                        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                        onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
                    >
                        <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
                        <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
                    </button>

                    {isAuthenticated ? (
                        <button
                            type="button"
                            className="nav-cta"
                            onClick={handleLogout}
                        >
                            Log out
                        </button>
                    ) : (
                        <>
                            <NavLink to="/login" onClick={closeMenu}>Log in</NavLink>
                            <Link className="nav-cta" to="/register" onClick={closeMenu}>
                                Get started <span aria-hidden="true">↗</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default AppNavbar;
