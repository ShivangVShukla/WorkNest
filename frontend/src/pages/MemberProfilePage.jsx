import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const API_URL = "http://localhost:8080/api";

function MemberProfilePage() {
    const [member, setMember] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [phone, setPhone] = useState("");
    const [membershipTier, setMembershipTier] = useState("PRO");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`${API_URL}/members/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                setMember(data);
                setCompanyName(data.companyName || "");
                setPhone(data.phone || "");
                setMembershipTier(data.membershipTier || "PRO");
            })
            .catch(() => { });
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const res = await fetch(`${API_URL}/members/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    companyName,
                    phone,
                    membershipTier,
                }),
            });

            if (!res.ok) throw new Error("Failed to update profile");
            const updated = await res.json();
            setMember(updated);
            setMessage("Profile updated successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

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
                    <Link to="/profile" style={{ color: "#314b39", fontWeight: 700 }}>Member Profile</Link>
                </div>

                <Link className="nav-cta" to="/">
                    ← Back to spaces
                </Link>
            </nav>

            <section className="spaces-section my-bookings-section">
                <div className="eyebrow">CO-WORKING MEMBER PROFILE</div>
                <h1>Member Account & Organization.</h1>
                <p>Manage your professional credentials, company billing details, and membership status.</p>

                <div className="member-profile-grid">
                    <div className="member-card profile-info-card">
                        <div className="member-avatar">
                            {member?.name ? member.name.charAt(0).toUpperCase() : "M"}
                        </div>
                        <h2>{member?.name || "Valued Member"}</h2>
                        <p className="member-email">{member?.email}</p>

                        <div className="member-tier-badge">
                            ⭐ Tier: <strong>{member?.membershipTier || "PRO"}</strong>
                        </div>

                        <div className="member-meta-stats">
                            <div>
                                <span>Member Since</span>
                                <strong>
                                    {member?.memberSince
                                        ? new Date(member.memberSince).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                                        : "October 2026"}
                                </strong>
                            </div>
                            <div>
                                <span>Access Level</span>
                                <strong>All Cities + Priority Cabins</strong>
                            </div>
                        </div>
                    </div>

                    <div className="member-card profile-form-card">
                        <h3>Update Organization & Billing Info</h3>
                        <form onSubmit={handleSave}>
                            <div className="booking-field">
                                <label className="field-label">COMPANY / TEAM NAME</label>
                                <input
                                    className="date-input"
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g. Acme Innovations Pvt Ltd"
                                />
                            </div>

                            <div className="booking-field">
                                <label className="field-label">CONTACT PHONE NUMBER</label>
                                <input
                                    className="date-input"
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div className="booking-field">
                                <label className="field-label">MEMBERSHIP TIER</label>
                                <select
                                    className="date-input"
                                    value={membershipTier}
                                    onChange={(e) => setMembershipTier(e.target.value)}
                                >
                                    <option value="BASIC">BASIC (Flexible Hot-Desking)</option>
                                    <option value="PRO">PRO (Dedicated Desks + Meeting Hours)</option>
                                    <option value="ENTERPRISE">ENTERPRISE (Private Team Cabins & Unlimited Access)</option>
                                </select>
                            </div>

                            {error && <p className="message error">{error}</p>}
                            {message && <p className="message">{message}</p>}

                            <button className="book-button" type="submit" disabled={saving}>
                                {saving ? "Saving changes..." : "Save Member Profile"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default MemberProfilePage;
