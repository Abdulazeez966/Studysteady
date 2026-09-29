import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";

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

        <div className="ss-card ss-card--center">
          <div className="ss-account-page-avatar">{initial}</div>
          <p className="ss-account-page-name">{user?.name || "—"}</p>
          <p className="ss-account-page-email">{user?.email || "—"}</p>
          <button type="button" className="ss-logout-btn" onClick={logOut}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
