import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import { getAllTasksFlat, getWaitingTasks } from "./course-utils";

export default function CatchupView() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const allTasks = getAllTasksFlat(user?.courses || []);
  const completed = allTasks.filter((t) => t.status === "completed");
  const waiting = getWaitingTasks(user?.courses || []);
  const recoveryTask = waiting[0];

  function startRecovery() {
    if (!recoveryTask) {
      navigate("/plan");
      return;
    }
    setUser((prev) => ({
      ...prev,
      courses: (prev.courses || []).map((c) => ({
        ...c,
        tasks: (c.tasks || []).map((t) => (t.id === recoveryTask.id ? { ...t, status: "in_progress" } : t)),
      })),
    }));
    navigate(`/plan/${recoveryTask.id}`);
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
            <p className="ss-eyebrow ss-catchup-activities-label">Activities waiting ({waiting.length})</p>
            <ul className="ss-waiting-list">
              {waiting.map((t) => (
                <li key={t.id} className="ss-list-row">
                  <span>{t.title} <span className="ss-waiting-list__course">· {t.courseTitle}</span></span>
                  <span className="ss-waiting-list__meta">
                    {t.status === "in_progress" ? "In progress" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {recoveryTask && (
          <div className="ss-card ss-recovery-card">
            <span className="ss-badge">Start here</span>
            <h2 className="ss-recovery-card__title">{recoveryTask.title}</h2>
            <button type="button" className="ss-btn-primary" onClick={startRecovery}>
              Begin this activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
