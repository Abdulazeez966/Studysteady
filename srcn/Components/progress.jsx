import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import { getActivities, getEvents, getGoals, getPlans } from "./api";
import ProgressRing from "./progress-ring";

export default function Progress() {
  const { user } = useUser();
  const token = user?.token;
  const [plans, setPlans] = useState([]);
  const [goals, setGoals] = useState([]);
  const [rows, setRows] = useState([]);
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
        const [planData, goalData] = await Promise.all([getPlans(token), getGoals(token)]);
        const nextPlans = Array.isArray(planData) ? planData : [];
        const results = await Promise.all(nextPlans.map(async (plan) => {
          const planId = plan._id || plan.id;
          const [eventsData, activitiesData] = await Promise.all([
            getEvents(token, { planId }),
            getActivities(token, { planId }),
          ]);
          return {
            plan,
            events: Array.isArray(eventsData) ? eventsData : [],
            activities: Array.isArray(activitiesData) ? activitiesData : [],
          };
        }));
        if (!active) return;
        setPlans(nextPlans);
        setGoals(Array.isArray(goalData) ? goalData : []);
        setRows(results);
      } catch (err) {
        if (active) setError(err?.message || "We couldn't load your progress.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [token]);

  const goalMap = useMemo(() => new Map(goals.map((goal) => [String(goal._id || goal.id), goal])), [goals]);
  const total = rows.reduce((sum, row) => sum + row.events.length, 0);
  const completed = rows.reduce((sum, row) => sum + row.events.filter((event) => event.status === "completed").length, 0);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return <div className="ss-page"><div className="ss-page__inner"><p className="ss-empty-state">Loading your progress…</p></div></div>;
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <h1>My Progress</h1>
        </div>

        {error ? (
          <div className="ss-field__error ss-standalone-error">{error}</div>
        ) : total === 0 ? (
          <div className="ss-card">
            <p className="ss-empty-state">
              You haven't added any courses yet. <Link to="/plan">Set up your plan</Link> to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="ss-card ss-page__section ss-card--center">
              <div className="ss-progress-ring-wrap">
                <ProgressRing value={completed} max={total} size={128} strokeWidth={12} />
              </div>
              <h2 className="ss-progress-percent-heading">{percent}% complete</h2>
              <p className="ss-progress-goal-label">Across {plans.length} course{plans.length === 1 ? "" : "s"}</p>

              <div className="ss-progress-stats">
                <div className="ss-progress-stat ss-progress-stat--done">
                  <div className="ss-progress-stat__num">{completed}</div>
                  <div className="ss-progress-stat__label">Done</div>
                </div>
                <div className="ss-progress-stat">
                  <div className="ss-progress-stat__num">{total - completed}</div>
                  <div className="ss-progress-stat__label">Left</div>
                </div>
              </div>
            </div>

            {rows.map(({ plan, events }) => {
              const planId = plan._id || plan.id;
              const goalId = plan.goal?._id || plan.goal;
              const goal = goalMap.get(String(goalId));
              const cCompleted = events.filter((event) => event.status === "completed").length;
              const completedEvents = events.filter((event) => event.status === "completed");
              return (
                <div key={planId} className="ss-card ss-course-section">
                  <div className="ss-course-section__header">
                    <h2 className="ss-plan-title">{goal?.subject || "Untitled course"}</h2>
                    <span className="ss-badge">{cCompleted}/{events.length}</span>
                  </div>
                  <div className="ss-progress-ring-wrap">
                    <ProgressRing value={cCompleted} max={events.length || 1} size={68} strokeWidth={7} />
                  </div>
                  {completedEvents.length > 0 && (
                    <ul className="ss-completed-list">
                      {completedEvents.map((event) => (
                        <li key={event._id || event.id} className="ss-list-row">
                          <span className="ss-completed-list__check">
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="#1B685E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          {event.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
