import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

export default function Account() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  function logOut() {
    setUser(null);
    navigate("/");
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/settings" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Settings
        </Link>
        <div className="ss-page-header">
          <h1>Account</h1>
        </div>

        <div className="ss-card" style={{ textAlign: "center" }}>
          <div className="ss-account-page-avatar">{initial}</div>
          <p style={{ fontFamily: "var(--ss-font-display)", fontWeight: 700, fontSize: 17 }}>{user?.name || "—"}</p>
          <p style={{ fontSize: 12.5, color: "var(--ss-stone)", marginBottom: 24 }}>{user?.email || "—"}</p>
          <button type="button" className="ss-logout-btn" onClick={logOut}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
