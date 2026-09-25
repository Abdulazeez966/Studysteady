import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

let idCounter = 0;
function uid() {
  idCounter += 1;
  return `task-${Date.now()}-${idCounter}`;
}

function seedTasks(goal) {
  const base = goal || "your course";
  return [
    { id: uid(), title: `Get started with ${base}`, status: "pending" },
    { id: uid(), title: "Complete the first module", status: "pending" },
    { id: uid(), title: "Do the practice exercise", status: "pending" },
  ];
}

const STATUS_LABELS = { pending: "Pending", in_progress: "In progress", completed: "Completed" };
const STATUS_CYCLE = { pending: "in_progress", in_progress: "completed", completed: "pending" };
const INACTIVITY_DAYS_THRESHOLD = 7;

export default function Plan() {
  const { user, setUser } = useUser();
  const tasks = user?.tasks ?? [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (!user?.tasks) {
      setUser((prev) => ({ ...prev, tasks: seedTasks(prev?.goal) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateTasks(next) {
    setUser((prev) => ({ ...prev, tasks: next }));
  }

  function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;
    updateTasks([...tasks, { id: uid(), title: newTask.trim(), status: "pending" }]);
    setNewTask("");
  }

  function removeTask(id) {
    updateTasks(tasks.filter((t) => t.id !== id));
  }

  function cycleStatus(task) {
    updateTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: STATUS_CYCLE[t.status] } : t)));
  }

  function startEdit(task, e) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(task.id);
    setEditValue(task.title);
  }

  function saveEdit(id) {
    if (editValue.trim()) {
      updateTasks(tasks.map((t) => (t.id === id ? { ...t, title: editValue.trim() } : t)));
    }
    setEditingId(null);
  }

  const daysSinceActive = user?.lastActiveAt
    ? (Date.now() - new Date(user.lastActiveAt).getTime()) / 86400000
    : 0;
  const showMissed = daysSinceActive >= INACTIVITY_DAYS_THRESHOLD && total > completed;
  const missedTasks = tasks.filter((t) => t.status !== "completed");

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <p className="ss-eyebrow ss-eyebrow--teal" style={{ marginBottom: 6 }}>Your plan</p>
        </div>

        <div className="ss-plan-goal-row">
          <h1 style={{ fontFamily: "var(--ss-font-display)", fontSize: 22, fontWeight: 700 }}>
            {user?.goal || "Set up your learning plan"}
          </h1>
          {total > 0 && <span className="ss-badge">{completed === total ? "Complete" : "On track"}</span>}
        </div>
        <p className="ss-plan-goal-meta">
          {user?.weeklyTime ? `${user.weeklyTime}` : ""}
          {user?.days ? ` · ${user.days}` : ""}
        </p>

        {user?.paused && (
          <div className="ss-paused-banner">
            <p>Your plan is paused{user.pauseReturnDate ? ` until ${user.pauseReturnDate}` : ""}.</p>
            <button
              type="button"
              className="ss-btn-secondary"
              onClick={() => setUser((prev) => ({ ...prev, paused: false }))}
            >
              Resume now
            </button>
          </div>
        )}

        {showMissed && (
          <div className="ss-card ss-page__section" style={{ borderColor: "var(--ss-attention)" }}>
            <p className="ss-plan-section-title">Missed activities</p>
            <ul className="ss-waiting-list">
              {missedTasks.slice(0, 3).map((t) => (
                <li key={t.id}>
                  <span>{t.title}</span>
                  <span className="ss-waiting-list__meta">{STATUS_LABELS[t.status]}</span>
                </li>
              ))}
            </ul>
            {missedTasks.length > 3 && (
              <p style={{ fontSize: 12, color: "var(--ss-stone)", marginTop: 8 }}>
                +{missedTasks.length - 3} more
              </p>
            )}
            <Link to="/catchup" className="ss-btn-primary" style={{ marginTop: 14, textDecoration: "none" }}>
              See catch-up plan
            </Link>
          </div>
        )}

        <div className="ss-card ss-page__section">
          <p className="ss-plan-section-title">All activities</p>

          {tasks.length === 0 ? (
            <p className="ss-empty-state">No tasks yet — add your first step below.</p>
          ) : (
            <ul className="ss-plan-list">
              {tasks.map((task) => (
                <li key={task.id} className="ss-plan-item">
                  <button
                    type="button"
                    className={`ss-plan-item__bullet ss-plan-item__bullet--${task.status}`}
                    onClick={() => cycleStatus(task)}
                    aria-label={`Cycle status for ${task.title}`}
                  >
                    {task.status === "completed" && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  {editingId === task.id ? (
                    <input
                      className="ss-plan-item__edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                      autoFocus
                    />
                  ) : (
                    <Link
                      to={`/plan/${task.id}`}
                      className={task.status === "completed" ? "ss-plan-item__title ss-plan-item__title--done" : "ss-plan-item__title"}
                      style={{ textDecoration: "none" }}
                    >
                      {task.title}
                    </Link>
                  )}

                  <span className="ss-plan-item__status-label">{STATUS_LABELS[task.status]}</span>

                  <div className="ss-plan-item__actions">
                    {editingId === task.id ? (
                      <button type="button" className="ss-plan-item__link" onClick={() => saveEdit(task.id)}>
                        Save
                      </button>
                    ) : (
                      <button type="button" className="ss-plan-item__link" onClick={(e) => startEdit(task, e)}>
                        Edit
                      </button>
                    )}
                    <button type="button" className="ss-plan-item__remove" onClick={() => removeTask(task.id)} aria-label={`Remove ${task.title}`}>
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form className="ss-plan-add" onSubmit={addTask}>
            <input
              type="text"
              placeholder="Add a new task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              aria-label="New task title"
            />
            <button type="submit" className="ss-btn-primary ss-btn-primary--compact">
              Add
            </button>
          </form>
        </div>

        <Link to="/plan/pause" className="ss-btn-secondary" style={{ width: "100%", textDecoration: "none" }}>
          Pause / Adjust plan
        </Link>
      </div>
    </div>
  );
}
