import { useState } from "react";
import "../App.css";

// Custom show/hide toggle instead of relying on the browser's native reveal
// icon — that native icon is desktop-Chrome/Edge-only and doesn't reliably
// appear on mobile browsers, which is exactly the "works on laptop, not on
// mobile" gap this fixes.

export default function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={error ? "ss-field ss-field--error" : "ss-field"}>
      <label htmlFor={id}>{label}</label>
      <div className="ss-password-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="ss-password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="3" y1="17" x2="17" y2="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      </div>
      {error ? <div className="ss-field__error">{error}</div> : hint ? <div className="ss-field__hint">{hint}</div> : null}
    </div>
  );
}
