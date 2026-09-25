import { useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

export default function PlanUpdatedPreview() {
  const { user } = useUser();
  const navigate = useNavigate();
  const tasks = user?.tasks ?? [];
  const remaining = tasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <h1>Your updated plan</h1>
          <p className="ss-page-header__sub">Here's how things look now.</p>
        </div>

        <div className="ss-preview-summary">
          <div className="ss-preview-summary__row">
            <span>Weekly time</span>
            <span>{user?.weeklyTime || "—"}</span>
          </div>
          <div className="ss-preview-summary__row">
            <span>Days</span>
            <span>{user?.days || "—"}</span>
          </div>
          <div className="ss-preview-summary__row">
            <span>Activities remaining</span>
            <span>{remaining}</span>
          </div>
        </div>

        <button type="button" className="ss-btn-primary" onClick={() => navigate("/plan")}>
          Continue with new schedule
        </button>
      </div>
    </div>
  );
}
