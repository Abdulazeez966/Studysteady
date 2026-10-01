import { useEffect, useMemo, useState } from "react";
import { useUser } from "../user-context";
import { createCourse, getEvents, getGoals, getPlans } from "./api";
import AddCourseForm from "./add-course-form";
import { splitByTimeBudget } from "./course-utils";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function localISODate() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function planForGoal(plans, goalId) {
  return plans.find((plan) => String(plan.goal) === String(goalId)) || null;
}

function eventId(event) {
  return event._id || event.id;
}

function computeVariant(goals, plans, events) {
  if (goals.length === 0) return "first-time";

  const activePlans = plans.filter((plan) => plan.status !== "completed");
  if ((plans.length > 0 && activePlans.length === 0) || goals.every((goal) => goal.status === "completed")) {
    return "plan-complete";
  }

  if (plans.some((plan) => plan.status === "paused")) return "paused";

  if (events.some((event) => event.status === "missed" || event.status === "snoozed")) return "catch-up";

  return "normal";
}

function TaskRow({ event, goalTitle }) {
  const statusLabel = event.status === "completed"
    ? "Done"
    : event.status === "missed"
      ? "Missed"
      : event.status === "snoozed"
        ? "Snoozed"
        : "Upcoming";

  return (
    <li className="ss-list-row ss-plan-item">
      <span className={event.status === "completed" ? "ss-plan-item__title ss-plan-item__title--done" : "ss-plan-item__title"}>
        {event.title}
      </span>
      <span className="ss-plan-item__status-label">
        {event.estimatedMinutes || 30}m · {goalTitle || "Goal"} · {statusLabel}
      </span>
    </li>
  );
}

function DashboardLoading() {
  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-card">
          <p className="ss-empty-state">Loading your goals and today&apos;s activities…</p>
        </div>
      </div>
    </div>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-card">
          <p className="ss-plan-section-title">We couldn&apos;t load your dashboard</p>
          <p className="ss-empty-state">{message}</p>
          <button type="button" className="ss-btn-primary" onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading, setLoading, error, setError } = useUser();
  const token = user?.token;
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const [goals, setGoals] = useState([]);
  const [plans, setPlans] = useState([]);
  const [todaysEvents, setTodaysEvents] = useState([]);
  const [loading, setLocalLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [catchupDismissed, setCatchupDismissed] = useState(false);
  const [minutesAvailable, setMinutesAvailable] = useState("");
  const [addingCourse, setAddingCourse] = useState(false);
  const [addingCourseError, setAddingCourseError] = useState("");
  const [addingCourseBusy, setAddingCourseBusy] = useState(false);

  const today = useMemo(() => localISODate(), []);
  const todayLabel = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date()), []);

  async function loadDashboard() {
    if (!token) {
      setGoals([]);
      setPlans([]);
      setTodaysEvents([]);
      setLocalLoading(false);
      setLoadError("You are not signed in. Please sign in again.");
      setError("You are not signed in. Please sign in again.");
      return;
    }

    setLocalLoading(true);
    setLoadError("");
    setLoading(true);
    setError("");

    try {
      const [goalData, eventData, planData] = await Promise.all([
        getGoals(token),
        getEvents(token, { date: today }),
        getPlans(token),
      ]);
      setGoals(Array.isArray(goalData) ? goalData : []);
      setTodaysEvents(Array.isArray(eventData) ? eventData : []);
      setPlans(Array.isArray(planData) ? planData : []);
    } catch (err) {
      const message = err?.message || "Something went wrong while loading your dashboard.";
      setLoadError(message);
      setError(message);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [token, today]);

  async function addCourse(course) {
    if (!token || addingCourseBusy) return;
    setAddingCourseBusy(true);
    setAddingCourseError("");
    try {
      await createCourse(token, course);
      setAddingCourse(false);
      await loadDashboard();
    } catch (err) {
      setAddingCourseError(err?.message || "We couldn't add that course.");
    } finally {
      setAddingCourseBusy(false);
    }
  }


  const goalsById = useMemo(
    () => new Map(goals.map((goal) => [String(goal._id || goal.id), goal])),
    [goals]
  );

  const activeEvents = useMemo(
    () => todaysEvents.filter((event) => {
      const plan = planForGoal(plans, event.goal);
      return !event.paused && plan?.status !== "paused";
    }),
    [todaysEvents, plans]
  );

  const todaysPending = activeEvents.filter((event) => event.status !== "completed");
  const todaysDone = activeEvents.filter((event) => event.status === "completed");
  const minutesLeft = todaysPending.reduce((sum, event) => sum + (event.estimatedMinutes || 30), 0);
  const budget = Number(minutesAvailable) || 0;
  const { fits, later } = splitByTimeBudget(todaysPending, budget);
  const shortest = todaysPending.length
    ? Math.min(...todaysPending.map((event) => event.estimatedMinutes || 30))
    : 0;
  const variant = useMemo(() => computeVariant(goals, plans, todaysEvents), [goals, plans, todaysEvents]);
  const completedCount = todaysDone.length;
  const waitingCount = todaysPending.length;

  const courseList = (
    <div className="ss-page__section">
      <div className="ss-courses-header">
        <p className="ss-plan-section-title">Your courses</p>
        <button type="button" className="ss-btn-link" onClick={() => setAddingCourse((value) => !value)}>
          {addingCourse ? "Cancel" : "+ Add course"}
        </button>
      </div>

      {addingCourse && (
        <div className="ss-card ss-page__section">
          <AddCourseForm
            onSave={addCourse}
            onCancel={() => setAddingCourse(false)}
            submitLabel={addingCourseBusy ? "Adding…" : "Add course"}
          />
          {addingCourseError && <div className="ss-field__error ss-standalone-error">{addingCourseError}</div>}
        </div>
      )}

      {goals.length === 0 ? (
        <p className="ss-empty-state">No goals yet — complete onboarding to get started.</p>
      ) : (
        <ul className="ss-course-list">
          {goals.map((goal) => {
            const id = goal._id || goal.id;
            const plan = planForGoal(plans, id);
            const goalEvents = todaysEvents.filter((event) => String(event.goal) === String(id));
            const done = goalEvents.filter((event) => event.status === "completed").length;
            const total = goalEvents.length;
            return (
              <li key={id}>
                <div className="ss-course-row">
                  <div>
                    <div className="ss-course-row__title">{goal.subject}</div>
                    <div className="ss-course-row__provider">{goal.provider || "—"}</div>
                  </div>
                  <div className="ss-course-row__meta">
                    {plan?.status === "paused" ? (
                      <span className="ss-badge ss-badge--attention">Paused</span>
                    ) : goal.status === "completed" ? (
                      <span className="ss-badge">Complete</span>
                    ) : total > 0 ? (
                      <span className="ss-badge">{done}/{total}</span>
                    ) : (
                      <span className="ss-badge">Active</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const todaysActivities = (
    <div className="ss-card">
      <p className="ss-plan-section-title">Today&apos;s activities · {todayLabel}</p>

      {activeEvents.length > 0 && (
        <p className="ss-todays-summary">
          {completedCount} of {activeEvents.length} done today
          {minutesLeft > 0 ? ` · ${minutesLeft} min to go` : ""}
        </p>
      )}

      <div className="ss-time-budget">
        <label htmlFor="minutes-available">I have</label>
        <input
          id="minutes-available"
          type="number"
          min="5"
          step="5"
          placeholder="30"
          value={minutesAvailable}
          onChange={(e) => setMinutesAvailable(e.target.value)}
        />
        <span>minutes today</span>
      </div>

      {activeEvents.length === 0 && (
        <p className="ss-empty-state">Nothing scheduled for today — enjoy the breathing room.</p>
      )}

      {activeEvents.length > 0 && todaysPending.length === 0 && (
        <p className="ss-empty-state">Everything planned for today is done.</p>
      )}

      {todaysPending.length > 0 && (
        <>
          {budget > 0 && <p className="ss-eyebrow ss-eyebrow--spaced">What fits in {budget} minutes</p>}
          {budget > 0 && fits.length === 0 ? (
            <p className="ss-empty-state">
              Nothing fits in {budget} minutes — the shortest activity today takes {shortest}.
            </p>
          ) : (
            <ul className="ss-plan-list">
              {fits.map((event) => (
                <TaskRow key={eventId(event)} event={event} goalTitle={goalsById.get(String(event.goal))?.subject} />
              ))}
            </ul>
          )}
          {budget > 0 && later.length > 0 && (
            <>
              <p className="ss-eyebrow ss-eyebrow--spaced">Also today, if you find more time</p>
              <ul className="ss-plan-list">
                {later.map((event) => (
                  <TaskRow key={eventId(event)} event={event} goalTitle={goalsById.get(String(event.goal))?.subject} />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {todaysDone.length > 0 && (
        <>
          <p className="ss-eyebrow ss-eyebrow--spaced">Done today</p>
          <ul className="ss-plan-list">
            {todaysDone.map((event) => (
              <TaskRow key={eventId(event)} event={event} goalTitle={goalsById.get(String(event.goal))?.subject} />
            ))}
          </ul>
        </>
      )}
    </div>
  );

  if (loading || isLoading) return <DashboardLoading />;
  if (loadError || error) return <DashboardError message={loadError || error} onRetry={loadDashboard} />;

  if (variant === "first-time") {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">Welcome</p>
          <h1 className="ss-dashboard__greeting">{firstName}</h1>
          {courseList}
          {todaysActivities}
        </div>
      </div>
    );
  }

  if (variant === "plan-complete") {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">{timeGreeting()}</p>
          <h1 className="ss-dashboard__greeting">{firstName}</h1>
          <div className="ss-plan-complete-card">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="1.5" />
              <path d="M12 20.5L17 25.5L28 14.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2>All courses complete!</h2>
            <p>You finished every activity across every course. That&apos;s real, steady progress.</p>
          </div>
          {courseList}
          {todaysActivities}
        </div>
      </div>
    );
  }

  if (variant === "catch-up" && !catchupDismissed) {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">Welcome back</p>
          <h1 className="ss-dashboard__greeting">{firstName}</h1>
          <div className="ss-card ss-catchup-card">
            <h2>Life gets busy — that&apos;s okay.</h2>
            <p className="ss-catchup-card__quote">
              &quot;Welcome back. Let&apos;s continue from where you stopped.&quot;
            </p>
            <div className="ss-catchup-stats">
              <div className="ss-catchup-stat ss-catchup-stat--done">
                <div className="ss-catchup-stat__num">{completedCount}</div>
                <div className="ss-catchup-stat__label">Activities done</div>
              </div>
              <div className="ss-catchup-stat ss-catchup-stat--waiting">
                <div className="ss-catchup-stat__num">{waitingCount}</div>
                <div className="ss-catchup-stat__label">Waiting</div>
              </div>
            </div>
            <p className="ss-empty-state">Some of today&apos;s activities need attention.</p>
            <button className="ss-catchup-card__later" onClick={() => setCatchupDismissed(true)}>
              Remind me later
            </button>
          </div>
          {courseList}
          {todaysActivities}
        </div>
      </div>
    );
  }

  if (variant === "paused") {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">{timeGreeting()}</p>
          <h1 className="ss-dashboard__greeting">{firstName}</h1>
          <div className="ss-card">
            <p className="ss-plan-section-title">Your plan is paused</p>
            <p className="ss-empty-state">Your paused plan will be available again when you resume it.</p>
          </div>
          {courseList}
          {todaysActivities}
        </div>
      </div>
    );
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <p className="ss-dashboard__greeting-label">{timeGreeting()}</p>
        <h1 className="ss-dashboard__greeting">{firstName}</h1>
        {courseList}
        {todaysActivities}
      </div>
    </div>
  );
}
