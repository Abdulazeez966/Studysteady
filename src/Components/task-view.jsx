import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useUser } from "../user-context";
import { WEEKDAYS } from "./course-utils";
import {
  completeActivity,
  getActivities,
  getEvent,
  getGoals,
  resumeEvent,
  startActivity,
  updateEvent,
} from "./api";

const STATUSES = ["pending", "in_progress", "completed"];
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

function nextDateForWeekday(dateValue, weekday) {
  const current = new Date(dateValue);
  const target = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(weekday);
  const next = new Date(current);
  const delta = (target - current.getDay() + 7) % 7;
  next.setDate(current.getDate() + delta);
  return localDateKey(next);
}

export default function TaskView() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const token = user?.token;

  const [event, setEvent] = useState(null);
  const [activity, setActivity] = useState(null);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const [minutesDraft, setMinutesDraft] = useState("30");

  async function loadTask() {
    if (!token || !taskId) return;
    setLoading(true);
    setError("");
    try {
      const eventData = await getEvent(token, taskId);
      const eventPlanId = eventData?.plan?._id || eventData?.plan;
      const [activities, goals] = await Promise.all([
        eventPlanId ? getActivities(token, { planId: eventPlanId }) : Promise.resolve([]),
        getGoals(token),
      ]);
      const linkedActivity = (Array.isArray(activities) ? activities : []).find(
        (item) => String(item.event) === String(eventId(eventData))
      );
      const linkedGoal = (Array.isArray(goals) ? goals : []).find(
        (item) => String(item._id || item.id) === String(eventData?.goal?._id || eventData?.goal)
      );
      setEvent(eventData);
      setActivity(linkedActivity || null);
      setGoal(linkedGoal || null);
      setMinutesDraft(String(eventData?.estimatedMinutes || 30));
    } catch (err) {
      setError(err?.message || "We couldn't load this task.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTask();
  }, [token, taskId]);

  const status = useMemo(() => {
    if (!event) return "pending";
    if (event.status === "completed" || activity?.status === "completed") return "completed";
    if (activity?.status === "in_progress") return "in_progress";
    return "pending";
  }, [event, activity]);

  async function setStatus(nextStatus) {
    if (!token || !event || saving) return;
    if (nextStatus === status) return;
    if (status === "completed") {
      setNotice("Completed activities cannot be moved back to an earlier status because the backend has no reset endpoint.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      let currentActivity = activity;

      if (nextStatus === "in_progress" && status === "pending") {
        currentActivity = await startActivity(token, eventId(event));
      }

      if (nextStatus === "completed") {
        if (!currentActivity) {
          currentActivity = await startActivity(token, eventId(event));
        }
        const completed = await completeActivity(token, activityId(currentActivity));
        setActivity(completed);
        setJustCompleted(true);
      } else if (currentActivity) {
        setActivity(currentActivity);
      }

      await loadTask();
    } catch (err) {
      setError(err?.message || "We couldn't update this task.");
    } finally {
      setSaving(false);
    }
  }

  async function commitMinutes() {
    if (!token || !event || saving) return;
    const minutes = Number(minutesDraft);
    if (!Number.isFinite(minutes) || minutes < 5) {
      setMinutesDraft(String(event.estimatedMinutes || 30));
      return;
    }

    setSaving(true);
    setError("");
    try {
      await updateEvent(token, eventId(event), {
        scheduledDate: event.scheduledDate,
        scheduledTime: event.scheduledTime,
        estimatedMinutes: minutes,
        title: event.title,
      });
      await loadTask();
    } catch (err) {
      setError(err?.message || "We couldn't update the duration.");
    } finally {
      setSaving(false);
    }
  }

  async function changeDay(day) {
    if (!token || !event || saving) return;
    setSaving(true);
    setError("");
    try {
      await updateEvent(token, eventId(event), {
        scheduledDate: nextDateForWeekday(event.scheduledDate, day),
        scheduledTime: event.scheduledTime,
        estimatedMinutes: event.estimatedMinutes,
        title: event.title,
      });
      await loadTask();
    } catch (err) {
      setError(err?.message || "We couldn't update the scheduled day.");
    } finally {
      setSaving(false);
    }
  }

  async function resume() {
    if (!token || !event || saving) return;
    setSaving(true);
    setError("");
    try {
      await resumeEvent(token, eventId(event));
      await loadTask();
    } catch (err) {
      setError(err?.message || "We couldn't resume this event.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-empty-state">Loading task…</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-empty-state">
            {error || "That task doesn't exist anymore."} <Link to="/plan">Back to Plan</Link>
          </p>
        </div>
      </div>
    );
  }

  const eventDay = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date(event.scheduledDate));
  const planId = event.plan?._id || event.plan;
  const eventIsPaused = Boolean(event.paused);

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/plan" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Plan
        </Link>

        {error && <div className="ss-card ss-card--attention"><p className="ss-empty-state">{error}</p></div>}
        {notice && <div className="ss-card"><p className="ss-empty-state">{notice}</p></div>}

        <p className="ss-eyebrow ss-eyebrow--teal ss-eyebrow--spaced">{goal?.subject || "Course"}</p>

        <div className="ss-segmented">
          {STATUSES.map((item) => (
            <button
              key={item}
              type="button"
              className={status === item ? "ss-segmented__opt--on" : ""}
              onClick={() => setStatus(item)}
              disabled={saving || status === "completed"}
            >
              {STATUS_LABELS[item]}
            </button>
          ))}
        </div>

        <span className="ss-badge">{eventDay}</span>
        {eventIsPaused && <span className="ss-badge ss-badge--attention" style={{ marginLeft: 8 }}>Paused</span>}
        <h1 className="ss-task-view-title">{event.title}</h1>

        <p className="ss-task-view__desc">
          Work through this activity at your own pace. Mark it complete when you're done.
        </p>

        <div className="ss-task-schedule">
          <div className="ss-field">
            <label htmlFor="task-day">Day</label>
            <select
              id="task-day"
              value={eventDay}
              onChange={(e) => changeDay(e.target.value)}
              disabled={saving}
            >
              {WEEKDAYS.map((day) => (
                <option key={day}>{day}</option>
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
              disabled={saving}
            />
          </div>
        </div>

        {eventIsPaused && (
          <button type="button" className="ss-btn-secondary ss-btn-secondary--block ss-btn-primary--mt" onClick={resume} disabled={saving}>
            Resume this activity
          </button>
        )}

        {status !== "completed" && (
          <button type="button" className="ss-btn-primary ss-btn-primary--mt" onClick={() => setStatus("completed")} disabled={saving}>
            {saving ? "Saving…" : "Mark as completed"}
          </button>
        )}

        <div className="ss-course-section__actions">
          <Link to={`/plan/pause/task/${eventId(event)}`} className="ss-btn-secondary">
            Pause / Adjust this activity
          </Link>
          <Link to={`/plan/reminders/task/${eventId(event)}`} className="ss-btn-secondary">
            Reminders for this activity
          </Link>
        </div>

        {planId && <p className="ss-empty-state">Event ID: {eventId(event)}</p>}
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
            <p>{event.title} is done.</p>
            <div className="ss-overlay__actions">
              <button className="ss-btn-primary" onClick={() => navigate("/plan")}>
                Back to plan
              </button>
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
