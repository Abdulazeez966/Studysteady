import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import { getActivities, getEvents } from "./api";

export default function CatchupView() {
  const { user } = useUser();
  const token = user?.token;
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!token) {
        setLoading(false);
        setError("Your session has expired. Please log in again.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [eventData, activityData] = await Promise.all([getEvents(token), getActivities(token)]);
        if (!active) return;
        setEvents(Array.isArray(eventData) ? eventData : []);
        setActivities(Array.isArray(activityData) ? activityData : []);
      } catch (err) {
        if (active) setError(err?.message || "We couldn't load your catch-up activities.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [token]);

  const completed = activities.filter((activity) => activity.status === "completed");
  const waitingEvents = events.filter((event) => event.status !== "completed" && !event.paused);
  const recoveryTask = waitingEvents[0];

  function startRecovery() {
    if (!recoveryTask) {
      navigate("/plan");
      return;
    }
    navigate(`/plan/${recoveryTask._id || recoveryTask.id}`);
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/dashboard" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </Link>

        <div className="ss-catchup-view__intro">
          <h1>Welcome back.</h1>
          <p>Life happens. Your progress is right where you left it — let's take one small step.</p>
        </div>

        {loading ? (
          <p className="ss-empty-state">Loading your catch-up activities…</p>
        ) : error ? (
          <div className="ss-field__error ss-standalone-error">{error}</div>
        ) : (
          <>
            <div className="ss-catchup-view__summary">
              <span className="ss-completed-list__check">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#1B685E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <strong>{completed.length} activities completed</strong>
                <span>That work is still here — nothing is lost.</span>
              </div>
            </div>

            {waitingEvents.length > 0 && (
              <>
                <p className="ss-eyebrow ss-catchup-activities-label">Activities waiting ({waitingEvents.length})</p>
                <ul className="ss-waiting-list">
                  {waitingEvents.map((event) => (
                    <li key={event._id || event.id} className="ss-list-row">
                      <span>{event.title}</span>
                      <span className="ss-waiting-list__meta">
                        {activities.some((activity) => String(activity.event) === String(event._id || event.id) && activity.status === "in_progress") ? "In progress" : "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {recoveryTask && (
              <div className="ss-card ss-recovery-card">
                <span className="ss-badge">Start here</span>
                <h2 className="ss-recovery-card__title">{recoveryTask.title}</h2>
                <button type="button" className="ss-btn-primary" onClick={startRecovery}>
                  Begin this activity
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
