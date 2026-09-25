import { useState, useEffect } from "react";
import { useUser } from "../user-context";
import ProgressRing from "./progress-ring";
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

export default function Plan() {
  const { user, setUser } = useUser();
  const tasks = user?.tasks ?? [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newTask, setNewTask] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const [goal, setGoal] = useState(user?.goal ?? "");
  const [weeklyTime, setWeeklyTime] = useState(user?.weeklyTime ?? "3 hours");
  const [days, setDays] = useState(user?.days ?? "Tue / Thu / Sat");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Completion overlay state — shown right after a task flips to "completed"
  const [completedOverlayTask, setCompletedOverlayTask] = useState(null);

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
    const nextStatus = STATUS_CYCLE[task.status];
    updateTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    if (nextStatus === "completed") {
      setCompletedOverlayTask(task);
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditValue(task.title);
  }

  function saveEdit(id) {
    if (editValue.trim()) {
      updateTasks(tasks.map((t) => (t.id === id ? { ...t, title: editValue.trim() } : t)));
    }
    setEditingId(null);
  }

  function saveSettings(e) {
    e.preventDefault();
    setUser((prev) => ({ ...prev, goal, weeklyTime, days }));
    setSettingsSaved(true);
  }

  // For the completion overlay: what's the task right after the one just completed?
  const overlayIndex = completedOverlayTask ? tasks.findIndex((t) => t.id === completedOverlayTask.id) : -1;
  const upNext = overlayIndex >= 0 ? tasks.slice(overlayIndex + 1).find((t) => t.status !== "completed") : null;
  const completedSoFar = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <p className="ss-page-header__eyebrow ss-eyebrow ss-eyebrow--teal">Your plan</p>
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
                    <span className={task.status === "completed" ? "ss-plan-item__title ss-plan-item__title--done" : "ss-plan-item__title"}>
                      {task.title}
                    </span>
                  )}

                  <span className="ss-plan-item__status-label">{STATUS_LABELS[task.status]}</span>

                  <div className="ss-plan-item__actions">
                    {editingId === task.id ? (
                      <button type="button" className="ss-plan-item__link" onClick={() => saveEdit(task.id)}>
                        Save
                      </button>
                    ) : (
                      <button type="button" className="ss-plan-item__link" onClick={() => startEdit(task)}>
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

        <button type="button" className="ss-btn-secondary" style={{ width: "100%" }} onClick={() => setShowSettings((v) => !v)}>
          {showSettings ? "Hide pause / adjust plan" : "Pause / Adjust plan"}
        </button>

        {showSettings && (
          <div className="ss-card ss-page__section" style={{ marginTop: 14 }}>
            <p className="ss-plan-section-title">Pause / Adjust plan</p>
            <form onSubmit={saveSettings} noValidate>
              <div className="ss-field">
                <label htmlFor="plan-goal">Learning goal</label>
                <input
                  id="plan-goal"
                  type="text"
                  value={goal}
                  onChange={(e) => { setGoal(e.target.value); setSettingsSaved(false); }}
                  placeholder="e.g. React course on Udemy"
                />
              </div>
              <div className="ss-field">
                <label htmlFor="plan-time">Weekly time</label>
                <select id="plan-time" value={weeklyTime} onChange={(e) => { setWeeklyTime(e.target.value); setSettingsSaved(false); }}>
                  <option>1 hour</option>
                  <option>3 hours</option>
                  <option>5 hours</option>
                  <option>10+ hours</option>
                </select>
              </div>
              <div className="ss-field">
                <label htmlFor="plan-days">Preferred days</label>
                <select id="plan-days" value={days} onChange={(e) => { setDays(e.target.value); setSettingsSaved(false); }}>
                  <option>Tue / Thu / Sat</option>
                  <option>Mon / Wed / Fri</option>
                  <option>Weekends only</option>
                  <option>Every day</option>
                </select>
              </div>
              <button type="submit" className="ss-btn-primary ss-btn-primary--compact">
                Save changes
              </button>
              {settingsSaved && <span className="ss-inline-saved">Saved.</span>}
            </form>
          </div>
        )}
      </div>

      {completedOverlayTask && (
        <div className="ss-overlay" onClick={() => setCompletedOverlayTask(null)}>
          <div className="ss-overlay__card" onClick={(e) => e.stopPropagation()}>
            <div className="ss-overlay__check">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M6 13L11 18L20 8" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2>Great work.</h2>
            <p>{completedOverlayTask.title} is done.</p>
            <div className="ss-overlay__ring-wrap">
              <ProgressRing value={completedSoFar} max={total} size={84} strokeWidth={8} />
            </div>
            {upNext && (
              <div className="ss-overlay__up-next">
                <div className="ss-overlay__up-next-eyebrow">Up next</div>
                <div className="ss-overlay__up-next-title">{upNext.title}</div>
              </div>
            )}
            <div className="ss-overlay__actions">
              {upNext && (
                <button className="ss-btn-primary" onClick={() => setCompletedOverlayTask(null)}>
                  See next step
                </button>
              )}
              <button className="ss-btn-link" onClick={() => setCompletedOverlayTask(null)}>
                Back to plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
