import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function PlanPauseConfirm() {
  const { scope } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const date = params.get("date");

  const dateLabel = date
    ? new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    : "your return date";

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-pause-confirm">
          <div className="ss-pause-confirm__icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M6 13L11 18L20 8" stroke="#1B685E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1>You're all set.</h1>
          <p>
            {scope === "course" ? "This course is" : "This activity is"} paused until {dateLabel}. Everything
            you've done stays right where it is — pick up whenever you're ready.
          </p>
          <button type="button" className="ss-btn-primary" onClick={() => navigate("/plan")}>
            Back to Plan
          </button>
        </div>
      </div>
    </div>
  );
}
