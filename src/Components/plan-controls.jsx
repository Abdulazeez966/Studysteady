import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

export default function PlanControls() {
  const { user } = useUser();

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
          <h1>Plan controls</h1>
          <p className="ss-page-header__sub">
            {user?.paused
              ? `Your plan is currently paused until ${user.pauseReturnDate || "your return date"}.`
              : "Pause your plan, or adjust your pace and schedule."}
          </p>
        </div>

        <Link to="/plan/pause" className="ss-btn-primary" style={{ textDecoration: "none" }}>
          Pause / Adjust
        </Link>
      </div>
    </div>
  );
}
