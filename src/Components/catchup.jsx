import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

export default function CatchupView() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const tasks = user?.tasks ?? [];
  const completed = tasks.filter((t) => t.status === "completed");
  const waiting = tasks.filter((t) => t.status !== "completed");
  const recoveryTask = waiting[0];

  function startRecovery() {
    if (!recoveryTask) {
      navigate("/plan");
      return;
    }
    setUser((prev) => ({
      ...prev,
      tasks: (prev.tasks || []).map((t) => (t.id === recoveryTask.id ? { ...t, status: "in_progress" } : t)),
    }));
    navigate("/plan");
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/dashboard" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </Link>

        <div className="ss-catchup-view__intro">
          <h1>Welcome back.</h1>
          <p>Life happens. Your progress is right where you left it — let's take one small step.</p>
        </div>

        <div className="ss-catchup-view__summary">
          <span className="ss-completed-list__check">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="#1B685E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <strong>{completed.length} activities completed</strong>
            <span>That work is still here — nothing is lost.</span>
          </div>
        </div>

        {waiting.length > 0 && (
          <>
            <p className="ss-eyebrow" style={{ marginBottom: 10 }}>Activities waiting ({waiting.length})</p>
            <ul className="ss-waiting-list">
              {waiting.map((t) => (
                <li key={t.id}>
                  <span>{t.title}</span>
                  <span className="ss-waiting-list__meta">
                    {t.status === "in_progress" ? "In progress" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {recoveryTask && (
          <div className="ss-recovery-card">
            <span className="ss-badge">Start here</span>
            <h2 style={{ fontFamily: "var(--ss-font-display)", fontSize: 18, fontWeight: 700, margin: "10px 0 16px" }}>
              {recoveryTask.title}
            </h2>
            <button type="button" className="ss-btn-primary" onClick={startRecovery}>
              Begin this activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
