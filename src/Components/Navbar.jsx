import { Link, useLocation } from "react-router-dom";
import "../App.css";

const tabs = [
  {
    to: "/dashboard",
    label: "Home",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8}>
        <path d="M4 11L12 4L20 11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10V19C6 19.55 6.45 20 7 20H17C17.55 20 18 19.55 18 19V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/plan",
    label: "Plan",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8}>
        <line x1="5" y1="7" x2="19" y2="7" strokeLinecap="round" />
        <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
        <line x1="5" y1="17" x2="13" y2="17" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/progress",
    label: "Progress",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4A8 8 0 0 1 20 12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 17.36a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.64 13a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 7a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 2.64 1.7 1.7 0 0 0 10 1.09V1a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 2.64a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 7a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="ss-bottom-nav">
      {tabs.map((tab) => {
        const active = location.pathname.startsWith(tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={active ? "ss-bottom-nav__item ss-bottom-nav__item--active" : "ss-bottom-nav__item"}
          >
            {tab.icon(active)}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
