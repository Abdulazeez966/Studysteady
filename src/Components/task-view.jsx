import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useUser } from "../user-context";
import { WEEKDAYS, findTask, isPaused } from "./course-utils";

const STATUSES = ["pending", "in_progress", "completed"];
const STATUS_LABELS = { pending: "Pending", in_progress: "In progress", completed: "Completed" };

export default function TaskView() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const courses = user?.courses || [];
  const found = findTask(courses, taskId);

  const [justCompleted, setJustCompleted] = useState(false);
  const [minutesDraft, setMinutesDraft] = useState(String(found?.task?.estimatedMinutes || 30));

  if (!found) {
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

  const { task, course } = found;

  function updateTask(patch, extra = {}) {
    setUser((prev) => ({
      ...prev,
      ...extra,
      courses: (prev.courses || []).map((c) =>
        c.id === course.id
          ? { ...c, tasks: (c.tasks || []).map((t) => (t.id === task.id ? { ...t, ...patch } : t)) }
          : c
      ),
    }));
  }

  function setStatus(status) {
    updateTask({ status }, status === "completed" ? { catchupNeeded: false } : {});
    if (status === "completed") setJustCompleted(true);
  }

  function commitMinutes() {
    const n = Number(minutesDraft);
    if (n >= 5) {
      updateTask({ estimatedMinutes: n });
    } else {
      setMinutesDraft(String(task.estimatedMinutes || 30));
    }
  }

  const idx = (course.tasks || []).findIndex((t) => t.id === task.id);
  const upNext = (course.tasks || []).slice(idx + 1).find((t) => t.status !== "completed");

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/plan" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Plan
        </Link>

        <p className="ss-eyebrow ss-eyebrow--teal ss-eyebrow--spaced">{course.title}</p>

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

        <span className="ss-badge">{task.scheduledDay || "Unscheduled"}</span>
        {isPaused(course, task) && <span className="ss-badge ss-badge--attention" style={{ marginLeft: 8 }}>Paused</span>}
        <h1 className="ss-task-view-title">{task.title}</h1>

        <p className="ss-task-view__desc">
          {task.description || "Work through this activity at your own pace. Mark it complete when you're done."}
        </p>

        <div className="ss-task-schedule">
          <div className="ss-field">
            <label htmlFor="task-day">Day</label>
            <select id="task-day" value={task.scheduledDay || WEEKDAYS[0]} onChange={(e) => updateTask({ scheduledDay: e.target.value })}>
              {WEEKDAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="ss-field">
            <label htmlFor="task-minutes">Minutes</label>
            <input
              id="task-minutes"
              type="number"
              min="5"
              step="5"
              value={minutesDraft}
              onChange={(e) => setMinutesDraft(e.target.value)}
              onBlur={commitMinutes}
            />
          </div>
        </div>

        {task.platformName && (
          <a className="ss-platform-card" href={task.platformUrl || "#"} target="_blank" rel="noreferrer">
            <div>
              <div className="ss-platform-card__label">Course platform</div>
              <div className="ss-platform-card__name">Open in {task.platformName}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="var(--ss-teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}

        {task.paused && isPaused(course, task) && (
          <button
            type="button"
            className="ss-btn-secondary ss-btn-secondary--block ss-btn-primary--mt"
            onClick={() => updateTask({ paused: false })}
          >
            Resume this activity
          </button>
        )}

        {task.status !== "completed" && (
          <button type="button" className="ss-btn-primary ss-btn-primary--mt" onClick={() => setStatus("completed")}>
            Mark as completed
          </button>
        )}

        <div className="ss-course-section__actions">
          <Link to={`/plan/pause/task/${task.id}`} className="ss-btn-secondary">
            Pause / Adjust this activity
          </Link>
          <Link to={`/plan/reminders/task/${task.id}`} className="ss-btn-secondary">
            Reminders for this activity
          </Link>
        </div>
      </div>

      {justCompleted && (
        <div className="ss-overlay" onClick={() => navigate("/plan")}>
          <div className="ss-overlay__card" onClick={(e) => e.stopPropagation()}>
            <div className="ss-overlay__check">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M6 13L11 18L20 8" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2>Another step forward.</h2>
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
