import { useState } from "react";
import PasswordField from "./password-field";
import EmailQuickAccess from "./email-quick-access";
import "../App.css";

export default function Signup({ onSubmit = () => {}, onNavigateLogin = () => {} }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!fullName.trim()) next.fullName = "Enter your full name.";
    if (!email.trim()) next.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    if (!password) next.password = "Create a password.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) {
      next.confirmPassword = "Passwords don't match.";
    }
    setErrors(next);
    if (Object.keys(next).length === 0) {
      onSubmit({ fullName, email, password });
    }
  }

  return (
    <div className="ss-auth">
      <div className="ss-auth-card">
        <h1>Create account</h1>
        <p className="ss-auth-card__sub">Let's get you set up in a few steps.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={errors.fullName ? "ss-field ss-field--error" : "ss-field"}>
            <label htmlFor="signup-fullname">Your name</label>
            <input
              id="signup-fullname"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
            {errors.fullName && <div className="ss-field__error">{errors.fullName}</div>}
          </div>

          <div className={errors.email ? "ss-field ss-field--error" : "ss-field"}>
            <label htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
              type="email"
              inputMode="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <div className="ss-field__error">{errors.email}</div>}
          </div>

          {email.includes("@") && <EmailQuickAccess email={email} />}

          <PasswordField
            id="signup-password"
            label="Password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint={!errors.password ? "At least 8 characters" : undefined}
            autoComplete="new-password"
          />

          <PasswordField
            id="signup-confirm"
            label="Confirm password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <button type="submit" className="ss-btn-primary">
            Create account
          </button>
        </form>

        <p className="ss-auth-card__footer">
          Already have an account?{" "}
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onNavigateLogin();
            }}
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
