import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import { updateAccount } from "./api";

export default function Account() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveAccount(event) {
    event.preventDefault();
    if (!user?.token || saving) return;
    setMessage("");
    setError("");

    const passwordIsChanging = Boolean(newPassword || currentPassword || confirmPassword);
    if (passwordIsChanging) {
      if (!currentPassword) {
        setError("Enter your current password to change your password.");
        return;
      }
      if (newPassword.length < 8) {
        setError("Your new password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("The new passwords do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await updateAccount(user.token, {
        name: name.trim(),
        email: email.trim(),
        currentPassword: passwordIsChanging ? currentPassword : undefined,
        newPassword: passwordIsChanging ? newPassword : undefined,
      });
      setUser({ ...user, ...updated });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Account details saved.");
    } catch (err) {
      setError(err?.message || "We couldn't update your account.");
    } finally {
      setSaving(false);
    }
  }

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

        <form className="ss-card" onSubmit={saveAccount}>
          <div className="ss-account-page-avatar">{initial}</div>
          <label className="ss-form-field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="ss-form-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <div className="ss-form-section">
            <h2>Change password</h2>
            <p>Leave these fields blank if you don't want to change your password.</p>
            <label className="ss-form-field">
              <span>Current password</span>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </label>
            <label className="ss-form-field">
              <span>New password</span>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} />
            </label>
            <label className="ss-form-field">
              <span>Confirm new password</span>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} />
            </label>
          </div>

          {error && <p className="ss-error">{error}</p>}
          {message && <p className="ss-success">{message}</p>}

          <button type="submit" className="ss-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" className="ss-logout-btn" onClick={logOut}>
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
