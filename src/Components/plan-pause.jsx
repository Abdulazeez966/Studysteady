import { Link } from "react-router-dom";
import "../App.css";

export default function PlanPauseChoice() {
  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/plan" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Plan
        </Link>
        <div className="ss-page-header">
          <h1>Pause or adjust your plan</h1>
          <p className="ss-page-header__sub">Life changes — your plan can too. Nothing here loses your progress.</p>
        </div>

        <div className="ss-pause-choice">
          <Link to="/plan/pause/date" className="ss-pause-choice__card">
            <h3>Pause my plan</h3>
            <p>Take a break until a date you choose. We'll wait for you.</p>
          </Link>
          <Link to="/plan/pause/schedule" className="ss-pause-choice__card">
            <h3>Adjust my schedule</h3>
            <p>Change your weekly time or preferred days going forward.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
