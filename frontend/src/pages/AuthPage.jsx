
import { useState } from "react";
import "../App.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080/api/auth";

function AuthPage({ mode }) {
    const isRegister = mode === "register";
    const navigate = useNavigate();
    const location = useLocation();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/${isRegister ? "register" : "login"}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        isRegister
                            ? { name: name.trim(), email: email.trim(), password }
                            : { email: email.trim(), password }
                    ),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.detail ||
                    data?.error ||
                    "Something went wrong. Please try again."
                );
            }

            if (!data?.token) {
                throw new Error("Authentication token was not received.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    userId: data.userId,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                })
            );
            window.dispatchEvent(new Event("worknest-auth-change"));

            navigate(location.state?.from || "/", { replace: true });
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-eyebrow">
                    {isRegister ? "YOUR SPACE, YOUR WAY" : "WELCOME BACK"}
                </div>

                <h1>
                    {isRegister ? "Find your place to work." : "Good to have you back."}
                </h1>

                <p className="auth-description">
                    {isRegister
                        ? "Create your account and discover a better way to work."
                        : "Sign in to manage your workspace bookings."}
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {isRegister && (
                        <div className="auth-field">
                            <label htmlFor="name">FULL NAME</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                autoComplete="name"
                                required
                            />
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="email">EMAIL ADDRESS</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            pattern="^[^@]+@[Gg][Mm][Aa][Ii][Ll][.][Cc][Oo][Mm]$"
                            title="Enter a valid gmail.com email address."
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">PASSWORD</label>
                        <input
                            id="password"
                            type="password"
                            placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={isRegister ? 8 : undefined}
                            maxLength={72}
                            autoComplete={isRegister ? "new-password" : "current-password"}
                            required
                        />
                    </div>

                    {error && <p className="auth-error" role="alert">{error}</p>}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isRegister
                                ? "Create account →"
                                : "Sign in →"}
                    </button>
                </form>

                <p className="auth-switch">
                    {isRegister ? "Already have an account?" : "New to Worknest?"}{" "}
                    <Link to={isRegister ? "/login" : "/register"}>
                        {isRegister ? "Sign in" : "Create an account"}
                    </Link>
                </p>

                <Link to="/" className="auth-home-link">
                    ← Back to exploring spaces
                </Link>
            </section>
        </main>
    );
}

export default AuthPage;
