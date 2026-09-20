import { useState } from "react";
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
    if (!password) next.password = "Create a password.";
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
        <p className="ss-auth-card__sub">Start your learning journey with StudySteady.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={errors.fullName ? "ss-field ss-field--error" : "ss-field"}>
            <label htmlFor="signup-fullname">Full name</label>
            <input
              id="signup-fullname"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {errors.fullName && <div className="ss-field__error">{errors.fullName}</div>}
          </div>

          <div className={errors.email ? "ss-field ss-field--error" : "ss-field"}>
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div className="ss-field__error">{errors.email}</div>}
          </div>

          <div className={errors.password ? "ss-field ss-field--error" : "ss-field"}>
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div className="ss-field__error">{errors.password}</div>}
          </div>

          <div className={errors.confirmPassword ? "ss-field ss-field--error" : "ss-field"}>
            <label htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <div className="ss-field__error">{errors.confirmPassword}</div>
            )}
          </div>

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
