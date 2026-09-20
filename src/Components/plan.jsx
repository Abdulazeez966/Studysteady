import { useState, useEffect } from "react";
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

export default function Plan() {
  const { user, setUser } = useUser();
  const tasks = user?.tasks ?? [];

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newTask, setNewTask] = useState("");

  const [goal, setGoal] = useState(user?.goal ?? "");
  const [weeklyTime, setWeeklyTime] = useState(user?.weeklyTime ?? "3 hours");
  const [days, setDays] = useState(user?.days ?? "Tue / Thu / Sat");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Seed a starter task list once, if one doesn't exist yet — never overwrites
  // an existing list.
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

  function changeStatus(id, status) {
    updateTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
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

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <p className="ss-page-header__eyebrow">Your plan</p>
          <h1>{user?.goal || "Set up your learning plan"}</h1>
          <p className="ss-page-header__sub">
            Adjust your pace any time — nothing here is locked in.
          </p>
        </div>

        <div className="ss-task-card ss-page__section">
          <div className="ss-task-card__eyebrow">Plan settings</div>
          <form onSubmit={saveSettings} noValidate>
            <div className="ss-field">
              <label htmlFor="plan-goal">Learning goal</label>
              <input
                id="plan-goal"
                type="text"
                placeholder="e.g. React course on Udemy"
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value);
                  setSettingsSaved(false);
                }}
              />
            </div>
            <div className="ss-field">
              <label htmlFor="plan-time">Weekly time</label>
              <select
                id="plan-time"
                value={weeklyTime}
                onChange={(e) => {
                  setWeeklyTime(e.target.value);
                  setSettingsSaved(false);
                }}
              >
                <option>1 hour</option>
                <option>3 hours</option>
                <option>5 hours</option>
                <option>10+ hours</option>
              </select>
            </div>
            <div className="ss-field">
              <label htmlFor="plan-days">Preferred days</label>
              <select
                id="plan-days"
                value={days}
                onChange={(e) => {
                  setDays(e.target.value);
                  setSettingsSaved(false);
                }}
              >
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

        <div className="ss-task-card">
          <div className="ss-task-card__eyebrow">Tasks</div>

          {tasks.length === 0 ? (
            <p className="ss-empty-state">No tasks yet — add your first step below.</p>
          ) : (
            <ul className="ss-plan-list">
              {tasks.map((task) => (
                <li key={task.id} className="ss-plan-item">
                  {editingId === task.id ? (
                    <input
                      className="ss-plan-item__edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={
                        task.status === "completed"
                          ? "ss-plan-item__title ss-plan-item__title--done"
                          : "ss-plan-item__title"
                      }
                    >
                      {task.title}
                    </span>
                  )}

                  <div className="ss-plan-item__actions">
                    <select
                      className="ss-plan-item__status"
                      value={task.status}
                      onChange={(e) => changeStatus(task.id, e.target.value)}
                      aria-label={`Status for ${task.title}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    {editingId === task.id ? (
                      <button type="button" className="ss-plan-item__link" onClick={() => saveEdit(task.id)}>
                        Save
                      </button>
                    ) : (
                      <button type="button" className="ss-plan-item__link" onClick={() => startEdit(task)}>
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="ss-plan-item__remove"
                      onClick={() => removeTask(task.id)}
                      aria-label={`Remove ${task.title}`}
                    >
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
      </div>
    </div>
  );
}
