import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

const STATUSES = ["pending", "in_progress", "completed"];
const STATUS_LABELS = { pending: "Pending", in_progress: "In progress", completed: "Completed" };

export default function TaskView() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const tasks = user?.tasks ?? [];
  const task = tasks.find((t) => t.id === taskId);

  const [justCompleted, setJustCompleted] = useState(false);

  if (!task) {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-empty-state">
            That task doesn't exist anymore. <Link to="/plan">Back to Plan</Link>
          </p>
        </div>
      </div>
    );
  }

  function setStatus(status) {
    setUser((prev) => ({
      ...prev,
      tasks: (prev.tasks || []).map((t) => (t.id === task.id ? { ...t, status } : t)),
    }));
    if (status === "completed") setJustCompleted(true);
  }

  const idx = tasks.findIndex((t) => t.id === task.id);
  const upNext = tasks.slice(idx + 1).find((t) => t.status !== "completed");

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/plan" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Plan
        </Link>

        <div className="ss-segmented">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={task.status === s ? "ss-segmented__opt--on" : ""}
              onClick={() => setStatus(s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <span className="ss-badge">{STATUS_LABELS[task.status]}</span>
        <h1 style={{ fontFamily: "var(--ss-font-display)", fontSize: 21, fontWeight: 700, margin: "10px 0 14px" }}>
          {task.title}
        </h1>

        <p className="ss-task-view__desc">
          {task.description || "Work through this activity at your own pace. Mark it complete when you're done."}
        </p>

        {task.platformName && (
          <a
            className="ss-platform-card"
            href={task.platformUrl || "#"}
            target="_blank"
            rel="noreferrer"
          >
            <div>
              <div className="ss-platform-card__label">Course platform</div>
              <div className="ss-platform-card__name">Open in {task.platformName}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="var(--ss-teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}

        {task.status !== "completed" && (
          <button type="button" className="ss-btn-primary" onClick={() => setStatus("completed")}>
            Mark as completed
          </button>
        )}
      </div>

      {justCompleted && (
        <div className="ss-overlay" onClick={() => navigate("/plan")}>
          <div className="ss-overlay__card" onClick={(e) => e.stopPropagation()}>
            <div className="ss-overlay__check">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M6 13L11 18L20 8" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2>Great work.</h2>
            <p>{task.title} is done.</p>
            {upNext && (
              <div className="ss-overlay__up-next">
                <div className="ss-overlay__up-next-eyebrow">Up next</div>
                <div className="ss-overlay__up-next-title">{upNext.title}</div>
              </div>
            )}
            <div className="ss-overlay__actions">
              {upNext ? (
                <button className="ss-btn-primary" onClick={() => navigate(`/plan/${upNext.id}`)}>
                  See next step
                </button>
              ) : null}
              <button className="ss-btn-link" onClick={() => navigate("/dashboard")}>
                Back to dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
