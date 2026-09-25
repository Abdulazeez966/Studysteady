import { Link } from "react-router-dom";
import "../App.css";

export default function Welcome() {
  return (
    <div className="ss-splash">
      <div className="ss-splash__mark">
        <div className="ss-splash__mark-dot" />
      </div>
      <h1 className="ss-splash__title">StudySteady</h1>
      <p className="ss-splash__tagline">Small Steps. Steady Progress.</p>
      <p className="ss-splash__sub">Stay on track with your learning, even when life gets busy.</p>

      <div className="ss-splash__actions">
        <Link to="/signup" className="ss-btn-primary">
          Get started
        </Link>
        <p className="ss-splash__login">
          Have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
