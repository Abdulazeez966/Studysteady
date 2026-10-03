import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../user-context";
import {
  adjustPlanSchedule,
  completeActivity,
  createCourse,
  getActivities,
  getEvents,
  getGoals,
  getPlans,
  startActivity,
  updateEvent,
} from "./api";
import AddCourseForm from "./add-course-form";

const STATUS_LABELS = { pending: "Pending", in_progress: "In progress", completed: "Completed" };

function eventId(event) {
  return event?._id || event?.id;
}

function activityId(activity) {
  return activity?._id || activity?.id;
}

function localDateKey(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function weekdayName(date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date(date));
}

function nextDateForWeekday(dateValue, weekday) {
  const current = new Date(dateValue);
  const target = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(weekday);
  const next = new Date(current);
  const delta = (target - current.getDay() + 7) % 7;
  next.setDate(current.getDate() + delta);
  return localDateKey(next);
}

function statusForEvent(event, activitiesByEvent) {
  if (event.status === "completed") return "completed";
  const activity = activitiesByEvent.get(String(eventId(event)));
  if (activity?.status === "completed") return "completed";
  if (activity?.status === "in_progress") return "in_progress";
  return "pending";
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date(date));
}

function buildCourseRows(plans, goals, eventMap, activityMap) {
  const goalsById = new Map(goals.map((goal) => [String(goal._id || goal.id), goal]));
  return plans.map((plan) => {
    const planId = String(plan._id || plan.id);
    const events = eventMap.get(planId) || [];
    const activities = activityMap.get(planId) || [];
    const activitiesByEvent = new Map(activities.map((activity) => [String(activity.event), activity]));
    const goal = goalsById.get(String(plan.goal));
    return {
      plan,
      goal,
      events,
      activities,
      activitiesByEvent,
    };
  });
}

export default function Plan() {
  const { user, setLoading, setError } = useUser();
  const token = user?.token;
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLocalLoading] = useState(true);
  const [error, setLocalError] = useState("");
  const [addingCourse, setAddingCourse] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newTaskByPlan, setNewTaskByPlan] = useState({});
  const [newTaskMinutesByPlan, setNewTaskMinutesByPlan] = useState({});
  const [notice, setNotice] = useState("");

  async function loadPlans() {
    if (!token) {
      setRows([]);
      setLocalLoading(false);
      setLocalError("You are not signed in. Please sign in again.");
      return;
    }

    setLocalLoading(true);
    setLocalError("");
    setError("");

    try {
      const [plansData, goalsData] = await Promise.all([getPlans(token), getGoals(token)]);
      const plans = Array.isArray(plansData) ? plansData : [];
      const goals = Array.isArray(goalsData) ? goalsData : [];
      const eventResults = await Promise.all(
        plans.map(async (plan) => {
          const id = plan._id || plan.id;
          const [events, activities] = await Promise.all([
            getEvents(token, { planId: id }),
            getActivities(token, { planId: id }),
          ]);
          return { id: String(id), events: Array.isArray(events) ? events : [], activities: Array.isArray(activities) ? activities : [] };
        })
      );
      const eventMap = new Map(eventResults.map((result) => [result.id, result.events]));
      const activityMap = new Map(eventResults.map((result) => [result.id, result.activities]));
      setRows(buildCourseRows(plans, goals, eventMap, activityMap));
    } catch (err) {
      const message = err?.message || "We couldn't load your plans.";
      setLocalError(message);
      setError(message);
    } finally {
      setLocalLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, [token]);

  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    }
  }, [location.hash, rows.length]);

  async function addCourse(data) {
    if (!token || saving) return;
    setSaving(true);
    setNotice("");
    setLocalError("");
    try {
      await createCourse(token, data);
      setAddingCourse(false);
      await loadPlans();
    } catch (err) {
      setLocalError(err?.message || "We couldn't add that course.");
    } finally {
      setSaving(false);
    }
  }

  async function cycleStatus(row, event) {
    if (!token || saving) return;
    const id = eventId(event);
    const current = statusForEvent(event, row.activitiesByEvent);

    if (current === "completed") {
      setNotice("Completed activities cannot be moved back to pending because the backend has no activity reset endpoint.");
      return;
    }

    setSaving(true);
    setNotice("");
    try {
      if (current === "pending") {
        await startActivity(token, id);
      } else {
        const activity = row.activitiesByEvent.get(String(id));
        if (!activity) {
          throw new Error("This event is marked in progress but has no activity record.");
        }
        await completeActivity(token, activityId(activity));
      }
      await loadPlans();
    } catch (err) {
      setLocalError(err?.message || "We couldn't update that activity.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(event, e) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(eventId(event));
    setEditValue(event.title || "");
  }

  async function saveEdit(row, event) {
    if (!token || saving) return;
    const title = editValue.trim();
    if (!title) {
      setEditingId(null);
      return;
    }

    setSaving(true);
    setNotice("");
    setLocalError("");
    try {
      const updated = await updateEvent(token, eventId(event), {
        title,
        estimatedMinutes: event.estimatedMinutes,
        scheduledDate: event.scheduledDate,
        scheduledTime: event.scheduledTime,
      });
      if (updated?.title !== title) {
        setNotice("The backend accepted the event update but did not update its title. Title editing needs a backend Event title field in the update operation.");
      }
      await loadPlans();
    } catch (err) {
      setLocalError(err?.message || "We couldn't update that task.");
    } finally {
      setEditingId(null);
      setSaving(false);
    }
  }

  async function saveMinutes(event, value) {
    if (!token || saving) return;
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes < 5) return;

    setSaving(true);
    setLocalError("");
    try {
      await updateEvent(token, eventId(event), {
        title: event.title,
        estimatedMinutes: minutes,
        scheduledDate: event.scheduledDate,
        scheduledTime: event.scheduledTime,
      });
      await loadPlans();
    } catch (err) {
      setLocalError(err?.message || "We couldn't update the duration.");
    } finally {
      setSaving(false);
    }
  }

  async function saveDay(event, weekday) {
    if (!token || saving) return;
    setSaving(true);
    setLocalError("");
    try {
      await updateEvent(token, eventId(event), {
        title: event.title,
        estimatedMinutes: event.estimatedMinutes,
        scheduledDate: nextDateForWeekday(event.scheduledDate, weekday),
        scheduledTime: event.scheduledTime,
      });
      await loadPlans();
    } catch (err) {
      setLocalError(err?.message || "We couldn't update the scheduled day.");
    } finally {
      setSaving(false);
    }
  }

  async function addTask(row, e) {
    e.preventDefault();
    if (!token || saving) return;
    const planId = String(row.plan._id || row.plan.id);
    const title = (newTaskByPlan[planId] || "").trim();
    if (!title) return;
    const minutes = Number(newTaskMinutesByPlan[planId]) || 30;
    const activities = [
      ...(row.plan.activities || []).map((activity) => ({
        title: activity.title,
        estimatedMinutes: activity.estimatedMinutes || 30,
      })),
      { title, estimatedMinutes: minutes },
    ];

    setSaving(true);
    setNotice("");
    setLocalError("");
    try {
      await adjustPlanSchedule(token, planId, {
        daysOfWeek: row.plan.daysOfWeek,
        activities,
        weeklyTime: row.plan.weeklyTime,
        endDate: row.plan.endDate,
      });
      setNewTaskByPlan((prev) => ({ ...prev, [planId]: "" }));
      setNewTaskMinutesByPlan((prev) => ({ ...prev, [planId]: "" }));
      setNotice("The plan template was updated. This backend currently does not generate Event documents when /plans/:id/adjust is called, so the new activity will not appear as a scheduled task until the schedule-generation behavior is extended.");
      await loadPlans();
    } catch (err) {
      setLocalError(err?.message || "We couldn't add that activity.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <div className="ss-card">
            <p className="ss-empty-state">Loading your plans…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <div className="ss-courses-header">
            <p className="ss-eyebrow ss-eyebrow--teal">Your plan</p>
            <button type="button" className="ss-btn-link" onClick={() => setAddingCourse((value) => !value)}>
              {addingCourse ? "Cancel" : "+ Add course"}
            </button>
          </div>
        </div>

        {addingCourse && (
          <div className="ss-card ss-page__section">
            <AddCourseForm onSave={addCourse} onCancel={() => setAddingCourse(false)} submitLabel={saving ? "Adding…" : "Add course"} />
          </div>
        )}

        {error && (
          <div className="ss-card ss-page__section ss-card--attention">
            <p className="ss-empty-state">{error}</p>
          </div>
        )}

        {notice && (
          <div className="ss-card ss-page__section">
            <p className="ss-empty-state">{notice}</p>
          </div>
        )}

        {rows.length === 0 ? (
          <p className="ss-empty-state">No courses yet — add one above to build your first plan.</p>
        ) : (
          rows.map((row) => {
            const planId = String(row.plan._id || row.plan.id);
            const events = [...row.events].sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
            const completed = events.filter((event) => statusForEvent(event, row.activitiesByEvent) === "completed").length;
            return (
              <div key={planId} id={planId} className="ss-card ss-course-section">
                <div className="ss-course-section__header">
                  <h2 className="ss-plan-title">{row.goal?.subject || "Course"}</h2>
                  {events.length > 0 && (
                    <span className="ss-badge">{completed === events.length ? "Complete" : "On track"}</span>
                  )}
                </div>
                <p className="ss-course-section__meta">
                  {row.goal?.provider ? `${row.goal.provider} · ` : ""}
                  {row.plan.weeklyTime || "—"} · {(row.plan.daysOfWeek || []).join(" / ") || "No days"}
                </p>

                {row.plan.status === "paused" && (
                  <div className="ss-paused-banner">
                    <p>Paused{row.plan.pausedUntil ? ` until ${formatDate(row.plan.pausedUntil)}` : ""}.</p>
                    <Link to={`/plan/pause/course/${planId}`} className="ss-btn-secondary">
                      Manage pause
                    </Link>
                  </div>
                )}

                {events.length === 0 ? (
                  <p className="ss-empty-state">No scheduled events for this plan.</p>
                ) : (
                  <ul className="ss-plan-list">
                    {events.map((event) => {
                      const id = eventId(event);
                      const status = statusForEvent(event, row.activitiesByEvent);
                      return (
                        <li key={id} className="ss-list-row ss-plan-item">
                          <button
                            type="button"
                            className={`ss-plan-item__bullet ss-plan-item__bullet--${status}`}
                            onClick={() => cycleStatus(row, event)}
                            aria-label={`Set status for ${event.title}`}
                            disabled={saving || status === "completed"}
                          >
                            {status === "completed" && (
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>

                          {editingId === id ? (
                            <input
                              className="ss-plan-item__edit-input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && saveEdit(row, event)}
                              autoFocus
                            />
                          ) : (
                            <Link
                              to={`/plan/${id}`}
                              className={status === "completed" ? "ss-plan-item__title ss-plan-item__title--done" : "ss-plan-item__title"}
                            >
                              {event.title}
                            </Link>
                          )}

                          <span className="ss-plan-item__status-label">
                            {event.paused ? "Paused" : `${weekdayName(event.scheduledDate).slice(0, 3)} · ${event.estimatedMinutes || 30}m · ${STATUS_LABELS[status]}`}
                          </span>

                          <div className="ss-plan-item__actions">
                            {editingId === id ? (
                              <button type="button" className="ss-plan-item__link" onClick={() => saveEdit(row, event)} disabled={saving}>
                                Save
                              </button>
                            ) : (
                              <button type="button" className="ss-plan-item__link" onClick={(e) => startEdit(event, e)}>
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              className="ss-plan-item__remove"
                              onClick={() => setNotice("The backend has no endpoint for deleting a single Event. The task has not been removed or faked as removed. Use Pause / Adjust for the closest supported control.")}
                              aria-label={`Remove ${event.title}`}
                            >
                              ×
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <form className="ss-plan-add" onSubmit={(e) => addTask(row, e)}>
                  <input
                    type="text"
                    placeholder="Add a new task"
                    value={newTaskByPlan[planId] || ""}
                    onChange={(e) => setNewTaskByPlan((prev) => ({ ...prev, [planId]: e.target.value }))}
                    aria-label={`New task for ${row.goal?.subject || "course"}`}
                  />
                  <input
                    type="number"
                    min="5"
                    step="5"
                    placeholder="min"
                    className="ss-plan-add__minutes"
                    value={newTaskMinutesByPlan[planId] || ""}
                    onChange={(e) => setNewTaskMinutesByPlan((prev) => ({ ...prev, [planId]: e.target.value }))}
                    aria-label={`Minutes for new task in ${row.goal?.subject || "course"}`}
                  />
                  <button type="submit" className="ss-btn-primary ss-btn-primary--compact" disabled={saving}>
                    {saving ? "Saving…" : "Add"}
                  </button>
                </form>

                <div className="ss-course-section__actions">
                  <Link to={`/plan/pause/course/${planId}`} className="ss-btn-secondary">
                    Pause / Adjust
                  </Link>
                  <Link to={`/plan/reminders/course/${planId}`} className="ss-btn-secondary">
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
