import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

export default function Progress() {
  const { user } = useUser();
  const tasks = user?.tasks ?? [];
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <p className="ss-page-header__eyebrow">Your progress</p>
          <h1>{user?.goal || "No course set up yet"}</h1>
          <p className="ss-page-header__sub">
            {total > 0
              ? "Here's where you stand — no pressure, just a clear picture."
              : "Set up a plan to start tracking progress."}
          </p>
        </div>

        {total === 0 ? (
          <div className="ss-task-card">
            <p className="ss-empty-state">
              You haven't added any tasks yet. <Link to="/plan">Set up your plan</Link> to get
              started.
            </p>
          </div>
        ) : (
          <>
            <div className="ss-task-card ss-page__section">
              <div className="ss-task-card__eyebrow">Completion</div>

              <div className="ss-trail">
                {tasks.flatMap((t, i) => {
                  const state =
                    t.status === "completed"
                      ? "done"
                      : t.status === "in_progress"
                      ? "today"
                      : "upcoming";
                  const items = [
                    <span key={`s${i}`} className={`ss-trail__stone ss-trail__stone--${state}`} />,
                  ];
                  if (i < tasks.length - 1) {
                    items.push(<span key={`g${i}`} className="ss-trail__gap" />);
                  }
                  return items;
                })}
              </div>

              <div className="ss-stats-row ss-stats-row--triple">
                <div className="ss-stat">
                  <div className="ss-stat__num">{percent}%</div>
                  <div className="ss-stat__label">complete</div>
                </div>
                <div className="ss-stat ss-stat--center">
                  <div className="ss-stat__num">{completed}</div>
                  <div className="ss-stat__label">done</div>
                </div>
                <div className="ss-stat ss-stat--right">
                  <div className="ss-stat__num">{total - completed}</div>
                  <div className="ss-stat__label">remaining</div>
                </div>
              </div>
            </div>

            <div className="ss-task-card">
              <div className="ss-task-card__eyebrow">Tasks</div>
              <ul className="ss-plan-list">
                {tasks.map((t) => (
                  <li key={t.id} className="ss-plan-item">
                    <span
                      className={
                        t.status === "completed"
                          ? "ss-plan-item__title ss-plan-item__title--done"
                          : "ss-plan-item__title"
                      }
                    >
                      {t.title}
                    </span>
                    <span className={`ss-status-tag ss-status-tag--${t.status}`}>
                      {STATUS_LABELS[t.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
