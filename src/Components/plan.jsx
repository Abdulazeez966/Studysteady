import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../user-context";
import { uid, daysPatternToList, getWaitingTasks, isPaused } from "./course-utils";
import AddCourseForm from "./add-course-form";

const STATUS_LABELS = { pending: "Pending", in_progress: "In progress", completed: "Completed" };
const STATUS_CYCLE = { pending: "in_progress", in_progress: "completed", completed: "pending" };

export default function Plan() {
  const { user, setUser } = useUser();
  const courses = user?.courses || [];
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    }
  }, [location.hash, courses.length]);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newTaskByCourse, setNewTaskByCourse] = useState({});
  const [newTaskMinutesByCourse, setNewTaskMinutesByCourse] = useState({});
  const [addingCourse, setAddingCourse] = useState(false);

  function updateCourse(courseId, updater) {
    setUser((prev) => ({
      ...prev,
      courses: (prev.courses || []).map((c) => (c.id === courseId ? updater(c) : c)),
    }));
  }

  function addCourse(course) {
    setUser((prev) => ({ ...prev, courses: [...(prev?.courses || []), course] }));
    setAddingCourse(false);
  }

  function addTask(course, e) {
    e.preventDefault();
    const title = (newTaskByCourse[course.id] || "").trim();
    if (!title) return;
    const minutes = Number(newTaskMinutesByCourse[course.id]) || 30;
    const dayList = daysPatternToList(course.days);
    const nextDay = dayList[(course.tasks || []).length % dayList.length];
    updateCourse(course.id, (c) => ({
      ...c,
      tasks: [...(c.tasks || []), { id: uid("task"), title, status: "pending", scheduledDay: nextDay, estimatedMinutes: minutes }],
    }));
    setNewTaskByCourse((prev) => ({ ...prev, [course.id]: "" }));
    setNewTaskMinutesByCourse((prev) => ({ ...prev, [course.id]: "" }));
  }

  function removeTask(course, taskId) {
    updateCourse(course.id, (c) => ({ ...c, tasks: (c.tasks || []).filter((t) => t.id !== taskId) }));
  }

  function cycleStatus(course, task) {
    const next = STATUS_CYCLE[task.status];
    updateCourse(course.id, (c) => ({
      ...c,
      tasks: (c.tasks || []).map((t) => (t.id === task.id ? { ...t, status: next } : t)),
    }));
    if (next === "completed") {
      setUser((prev) => ({ ...prev, catchupNeeded: false }));
    }
  }

  function startEdit(task, e) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(task.id);
    setEditValue(task.title);
  }

  function saveEdit(course, taskId) {
    if (editValue.trim()) {
      updateCourse(course.id, (c) => ({
        ...c,
        tasks: (c.tasks || []).map((t) => (t.id === taskId ? { ...t, title: editValue.trim() } : t)),
      }));
    }
    setEditingId(null);
  }

  const missedTasks = getWaitingTasks(courses);
  const showMissed = Boolean(user?.catchupNeeded) && missedTasks.length > 0;

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <div className="ss-courses-header">
            <p className="ss-eyebrow ss-eyebrow--teal">Your plan</p>
            <button type="button" className="ss-btn-link" onClick={() => setAddingCourse((v) => !v)}>
              {addingCourse ? "Cancel" : "+ Add course"}
            </button>
          </div>
        </div>

        {addingCourse && (
          <div className="ss-card ss-page__section">
            <AddCourseForm onSave={addCourse} onCancel={() => setAddingCourse(false)} />
          </div>
        )}

        {showMissed && (
          <div className="ss-card ss-page__section ss-card--attention">
            <p className="ss-plan-section-title">Missed activities</p>
            <ul className="ss-waiting-list">
              {missedTasks.slice(0, 3).map((t) => (
                <li key={t.id}>
                  <span>{t.title} <span style={{ color: "var(--ss-stone)" }}>· {t.courseTitle}</span></span>
                  <span className="ss-waiting-list__meta">{STATUS_LABELS[t.status]}</span>
                </li>
              ))}
            </ul>
            <Link to="/catchup" className="ss-btn-primary ss-btn-primary--mt">
              See catch-up plan
            </Link>
          </div>
        )}

        {courses.length === 0 ? (
          <p className="ss-empty-state">No courses yet — add one above to build your first plan.</p>
        ) : (
          courses.map((course) => {
            const tasks = course.tasks || [];
            const completed = tasks.filter((t) => t.status === "completed").length;
            return (
              <div key={course.id} id={course.id} className="ss-card ss-course-section">
                <div className="ss-course-section__header">
                  <h2 className="ss-plan-title">{course.title}</h2>
                  {tasks.length > 0 && (
                    <span className="ss-badge">{completed === tasks.length ? "Complete" : "On track"}</span>
                  )}
                </div>
                <p className="ss-course-section__meta">
                  {course.provider ? `${course.provider} · ` : ""}
                  {course.weeklyTime} · {course.days}
                </p>

                {isPaused(course) && (
                  <div className="ss-paused-banner">
                    <p>Paused{course.pauseReturnDate ? ` until ${course.pauseReturnDate}` : ""}.</p>
                    <button
                      type="button"
                      className="ss-btn-secondary"
                      onClick={() => updateCourse(course.id, (c) => ({ ...c, paused: false }))}
                    >
                      Resume now
                    </button>
                  </div>
                )}

                {tasks.length === 0 ? (
                  <p className="ss-empty-state">No tasks yet — add the first one below.</p>
                ) : (
                  <ul className="ss-plan-list">
                    {tasks.map((task) => (
                      <li key={task.id} className="ss-list-row ss-plan-item">
                        <button
                          type="button"
                          className={`ss-plan-item__bullet ss-plan-item__bullet--${task.status}`}
                          onClick={() => cycleStatus(course, task)}
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
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(course, task.id)}
                            autoFocus
                          />
                        ) : (
                          <Link
                            to={`/plan/${task.id}`}
                            className={task.status === "completed" ? "ss-plan-item__title ss-plan-item__title--done" : "ss-plan-item__title"}
                          >
                            {task.title}
                          </Link>
                        )}

                        <span className="ss-plan-item__status-label">
                          {isPaused(course, task) ? "Paused" : `${task.scheduledDay?.slice(0, 3)} · ${task.estimatedMinutes || 30}m`}
                        </span>

                        <div className="ss-plan-item__actions">
                          {editingId === task.id ? (
                            <button type="button" className="ss-plan-item__link" onClick={() => saveEdit(course, task.id)}>
                              Save
                            </button>
                          ) : (
                            <button type="button" className="ss-plan-item__link" onClick={(e) => startEdit(task, e)}>
                              Edit
                            </button>
                          )}
                          <button type="button" className="ss-plan-item__remove" onClick={() => removeTask(course, task.id)} aria-label={`Remove ${task.title}`}>
                            ×
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <form className="ss-plan-add" onSubmit={(e) => addTask(course, e)}>
                  <input
                    type="text"
                    placeholder="Add a new task"
                    value={newTaskByCourse[course.id] || ""}
                    onChange={(e) => setNewTaskByCourse((prev) => ({ ...prev, [course.id]: e.target.value }))}
                    aria-label={`New task for ${course.title}`}
                  />
                  <input
                    type="number"
                    min="5"
                    step="5"
                    placeholder="min"
                    className="ss-plan-add__minutes"
                    value={newTaskMinutesByCourse[course.id] || ""}
                    onChange={(e) => setNewTaskMinutesByCourse((prev) => ({ ...prev, [course.id]: e.target.value }))}
                    aria-label={`Minutes for new task in ${course.title}`}
                  />
                  <button type="submit" className="ss-btn-primary ss-btn-primary--compact">
                    Add
                  </button>
                </form>

                <div className="ss-course-section__actions">
                  <Link to={`/plan/pause/course/${course.id}`} className="ss-btn-secondary">
                    Pause / Adjust
                  </Link>
                  <Link to={`/plan/reminders/course/${course.id}`} className="ss-btn-secondary">
                    Reminders
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
