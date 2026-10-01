import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import { getGoals, getPlans } from "./api";

export default function PlanControls() {
  const { user } = useUser();
  const token = user?.token;
  const [plans, setPlans] = useState([]);
  const [goals, setGoals] = useState([]);
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
        if (!active) return;
        setPlans(Array.isArray(planData) ? planData : []);
        setGoals(Array.isArray(goalData) ? goalData : []);
      } catch (err) {
        if (active) setError(err?.message || "We couldn't load your plan controls.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [token]);

  const goalMap = new Map(goals.map((goal) => [String(goal._id || goal.id), goal]));

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/settings" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Settings
        </Link>
        <div className="ss-page-header">
          <h1>Plan controls</h1>
          <p className="ss-page-header__sub">Pause or adjust any course, or go to a task to control it on its own.</p>
        </div>

        {loading ? (
          <p className="ss-empty-state">Loading your courses…</p>
        ) : error ? (
          <div className="ss-field__error ss-standalone-error">{error}</div>
        ) : plans.length === 0 ? (
          <p className="ss-empty-state">No courses yet.</p>
        ) : (
          <ul className="ss-course-list">
            {plans.map((plan) => {
              const planId = plan._id || plan.id;
              const goalId = plan.goal?._id || plan.goal;
              const goal = goalMap.get(String(goalId));
              const paused = plan.status === "paused";
              return (
                <li key={planId}>
                  <Link to={`/plan/pause/course/${planId}`} className="ss-course-row">
                    <div>
                      <div className="ss-course-row__title">{goal?.subject || "Untitled course"}</div>
                      <div className="ss-course-row__provider">
                        {paused ? `Paused until ${plan.pausedUntil ? new Date(plan.pausedUntil).toLocaleDateString() : "—"}` : "Active"}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
