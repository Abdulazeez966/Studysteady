import { useState } from "react";
import PasswordField from "./password-field";
import "../App.css";

export default function Login({ onSubmit = () => {}, onNavigateSignup = () => {} }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!email.trim()) next.email = "Enter your email.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      onSubmit({ email, password });
    }
  }

  return (
    <div className="ss-auth">
      <div className="ss-auth-card">
        <h1>Welcome back</h1>
        <p className="ss-auth-card__sub">Log in to your journey.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={errors.email ? "ss-field ss-field--error" : "ss-field"}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <div className="ss-field__error">{errors.email}</div>}
          </div>

          <PasswordField
            id="login-password"
            label="Password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          <div className="ss-auth-row">
            <a href="#forgot-password" className="ss-auth-link">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="ss-btn-primary">
            Log in
          </button>
        </form>

        <p className="ss-auth-card__footer">
          Don't have an account?{" "}
          <a
            href="#signup"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSignup();
            }}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
