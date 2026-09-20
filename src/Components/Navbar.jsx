import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

const links = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Plan", to: "/plan" },
  { label: "Progress", to: "/progress" },
  { label: "Reminders", to: "/reminders" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="ss-navbar">
      <div className="ss-navbar__inner">
        <Link to="/dashboard" className="ss-navbar__brand">
          StudySteady
        </Link>

        <div className="ss-navbar__links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={
                location.pathname === link.to
                  ? "ss-navbar__link ss-navbar__link--active"
                  : "ss-navbar__link"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          className="ss-navbar__toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <path
                d="M5 5L17 17M17 5L5 17"
                stroke="var(--ss-ink)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" stroke="var(--ss-ink)" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="var(--ss-ink)" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="3" y1="16" x2="19" y2="16" stroke="var(--ss-ink)" strokeWidth="1.8" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div className={open ? "ss-navbar__mobile ss-open" : "ss-navbar__mobile"}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className={
              location.pathname === link.to
                ? "ss-navbar__mobile-link ss-navbar__mobile-link--active"
                : "ss-navbar__mobile-link"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
