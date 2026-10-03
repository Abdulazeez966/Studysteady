import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import { deleteAccount } from "./api";

export default function Account() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  function logOut() {
    setUser(null);
    navigate("/");
  }

  async function handleDelete(event) {
    event.preventDefault();
    setError("");

    if (confirmation !== "DELETE") {
      setError('Type DELETE to confirm account deletion.');
      return;
    }
    if (!password) {
      setError('Enter your password to continue.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(user.token, password);
      setUser(null);
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to delete your account.");
      setIsDeleting(false);
    }
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

        <div className="ss-card ss-danger-card">
          <h2 className="ss-danger-card__title">Delete account</h2>
          <p className="ss-danger-card__text">
            Permanently delete your StudySteady account and your saved goals, plans, events, activities, and reminder settings. This cannot be undone.
          </p>

          {!showDelete ? (
            <button type="button" className="ss-delete-account-btn" onClick={() => { setShowDelete(true); setError(""); }}>
              Delete my account
            </button>
          ) : (
            <form onSubmit={handleDelete} className="ss-delete-account-form">
              <label className="ss-form-label" htmlFor="delete-password">Password</label>
              <input
                id="delete-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={isDeleting}
              />

              <label className="ss-form-label" htmlFor="delete-confirmation">Type DELETE to confirm</label>
              <input
                id="delete-confirmation"
                type="text"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                placeholder="DELETE"
                disabled={isDeleting}
              />

              {error ? <p className="ss-form-error" role="alert">{error}</p> : null}

              <div className="ss-delete-account-actions">
                <button type="button" className="ss-secondary-btn" onClick={() => { setShowDelete(false); setPassword(""); setConfirmation(""); setError(""); }} disabled={isDeleting}>
                  Cancel
                </button>
                <button type="submit" className="ss-delete-account-btn" disabled={isDeleting}>
                  {isDeleting ? "Deleting…" : "Permanently delete"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
