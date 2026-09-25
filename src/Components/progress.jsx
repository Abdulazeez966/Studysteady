import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import ProgressRing from "./progress-ring";
import "../App.css";

export default function Progress() {
  const { user } = useUser();
  const tasks = user?.tasks ?? [];
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <h1>My Progress</h1>
        </div>

        {total === 0 ? (
          <div className="ss-card">
            <p className="ss-empty-state">
              You haven't added any tasks yet. <Link to="/plan">Set up your plan</Link> to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="ss-card ss-page__section" style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                <ProgressRing value={completed} max={total} size={128} strokeWidth={12} />
              </div>
              <h2 style={{ fontFamily: "var(--ss-font-display)", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>
                {percent}% complete
              </h2>
              <p style={{ fontSize: 13.5, color: "var(--ss-stone)", margin: 0 }}>{user?.goal || "Your course"}</p>

              <div className="ss-progress-stats">
                <div className="ss-progress-stat ss-progress-stat--done">
                  <div className="ss-progress-stat__num">{completed}</div>
                  <div className="ss-progress-stat__label">Done</div>
                </div>
                <div className="ss-progress-stat">
                  <div className="ss-progress-stat__num">{total - completed}</div>
                  <div className="ss-progress-stat__label">Left</div>
                </div>
              </div>
            </div>

            <div className="ss-card">
              <p className="ss-plan-section-title">Completed</p>
              {completedTasks.length === 0 ? (
                <p className="ss-empty-state">Nothing completed yet — that's alright, one step at a time.</p>
              ) : (
                <ul className="ss-completed-list">
                  {completedTasks.map((t) => (
                    <li key={t.id}>
                      <span className="ss-completed-list__check">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="#1B685E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {t.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
