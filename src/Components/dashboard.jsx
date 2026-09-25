import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import ProgressRing from "./progress-ring";
import "../App.css";

const INACTIVITY_DAYS_THRESHOLD = 7; // per design doc decision OD2

function computeVariant(user) {
  const tasks = user?.tasks ?? [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  if (!user?.hasVisitedDashboard) return "first-time";
  if (total > 0 && completed === total) return "plan-complete";
  if (user?.paused) return "paused";

  if (user?.lastActiveAt) {
    const daysSince = (Date.now() - new Date(user.lastActiveAt).getTime()) / 86400000;
    if (daysSince >= INACTIVITY_DAYS_THRESHOLD) return "catch-up";
  }
  return "normal";
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user, setUser } = useUser();
  const tasks = user?.tasks ?? [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  // Freeze which variant to show for this visit — computed once at mount, so
  // marking lastActiveAt "now" a moment later doesn't flip the UI mid-visit.
  const [variant] = useState(() => computeVariant(user));
  const [catchupDismissed, setCatchupDismissed] = useState(false);

  useEffect(() => {
    setUser((prev) => ({
      ...prev,
      hasVisitedDashboard: true,
      lastActiveAt: new Date().toISOString(),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const todayTask = pendingTasks[0];
  const nextTask = pendingTasks[1];
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const courseRow = user?.goal ? (
    <Link to="/plan" className="ss-dashboard__course">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M2 3.5C2 2.7 2.7 2 3.5 2H8V13H3.5C2.7 13 2 13.7 2 14V3.5Z" stroke="var(--ss-teal)" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M14 3.5C14 2.7 13.3 2 12.5 2H8V13H12.5C13.3 13 14 13.7 14 14V3.5Z" stroke="var(--ss-teal)" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      <span>
        <span className="ss-dashboard__course-label">Currently learning</span>
        <br />
        <span className="ss-dashboard__course-title">{user.goal}</span>
      </span>
    </Link>
  ) : null;

  // ---------- First-time ----------
  if (variant === "first-time") {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">Welcome</p>
          <h1 className="ss-dashboard__greeting">{firstName} 👋</h1>
          {courseRow}
          <div className="ss-task-card">
            <span className="ss-badge">First activity</span>
            <h2 className="ss-task-card__title" style={{ marginTop: 10 }}>
              {todayTask ? todayTask.title : "Your plan is ready"}
            </h2>
            <p className="ss-task-card__meta">
              {user?.weeklyTime ? `${user.weeklyTime} this week` : "Let's get moving"}
              {user?.days ? ` · ${user.days}` : ""}
            </p>
            <Link to="/plan" className="ss-btn-primary">
              Begin first activity
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Plan complete ----------
  if (variant === "plan-complete") {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">{timeGreeting()}</p>
          <h1 className="ss-dashboard__greeting">{firstName} 👋</h1>
          <div className="ss-plan-complete-card">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="1.5" />
              <path d="M12 20.5L17 25.5L28 14.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2>Plan complete!</h2>
            <p>You finished every activity in this plan. That's real, steady progress.</p>
            <Link to="/plan" className="ss-btn-secondary">
              Start a new plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Paused ----------
  if (variant === "paused") {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">{timeGreeting()}</p>
          <h1 className="ss-dashboard__greeting">{firstName} 👋</h1>
          {courseRow}
          <div className="ss-paused-banner">
            <p>
              Your plan is paused{user?.pauseReturnDate ? ` until ${user.pauseReturnDate}` : ""}. Everything's
              saved exactly as you left it.
            </p>
            <button
              type="button"
              className="ss-btn-primary"
              onClick={() => setUser((prev) => ({ ...prev, paused: false }))}
            >
              Resume now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Catch-up ----------
  if (variant === "catch-up" && !catchupDismissed) {
    const waiting = total - completed;
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">Welcome back</p>
          <h1 className="ss-dashboard__greeting">{firstName} 👋</h1>
          {courseRow}
          <div className="ss-catchup-card">
            <h2>Life gets busy — that's okay.</h2>
            <p className="ss-catchup-card__quote">
              "Welcome back. Let's continue from where you stopped."
            </p>
            <div className="ss-catchup-stats">
              <div className="ss-catchup-stat ss-catchup-stat--done">
                <div className="ss-catchup-stat__num">{completed}</div>
                <div className="ss-catchup-stat__label">Activities done</div>
              </div>
              <div className="ss-catchup-stat ss-catchup-stat--waiting">
                <div className="ss-catchup-stat__num">{waiting}</div>
                <div className="ss-catchup-stat__label">Waiting</div>
              </div>
            </div>
            <Link to="/catchup" className="ss-btn-primary">
              See my catch-up plan
            </Link>
            <button className="ss-catchup-card__later" onClick={() => setCatchupDismissed(true)}>
              Remind me later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Normal ----------
  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <p className="ss-dashboard__greeting-label">{timeGreeting()}</p>
        <h1 className="ss-dashboard__greeting">{firstName} 👋</h1>
        {courseRow}

        {todayTask ? (
          <div className="ss-task-card">
            <div className="ss-task-card__top">
              <span className="ss-eyebrow">Today's task</span>
              <span className={todayTask.status === "in_progress" ? "ss-badge" : "ss-badge ss-badge--attention"}>
                {todayTask.status === "in_progress" ? "In progress" : "Pending"}
              </span>
            </div>
            <h2 className="ss-task-card__title">{todayTask.title}</h2>
            <p className="ss-task-card__meta">
              {user?.weeklyTime ? `≈ ${user.weeklyTime.replace(" hours", " hrs").replace(" hour", " hr")} this week` : ""}
              {user?.goal ? ` · ${user.goal}` : ""}
            </p>
            <Link to="/plan" className="ss-btn-primary">
              Start this activity →
            </Link>
          </div>
        ) : (
          <div className="ss-task-card">
            <p className="ss-empty-state">
              No tasks yet — <Link to="/plan">set up your plan</Link> to get your first task.
            </p>
          </div>
        )}

        {total > 0 && (
          <div className="ss-dash-progress">
            <ProgressRing value={completed} max={total} size={68} strokeWidth={7} />
            <div className="ss-dash-progress__text">
              <strong>{percent}% complete</strong>
              <span>
                {completed} of {total} activities done
              </span>
            </div>
          </div>
        )}

        {nextTask && (
          <div className="ss-next-step">
            <div>
              <div className="ss-next-step__eyebrow">Next step</div>
              <div className="ss-next-step__title">{nextTask.title}</div>
              <div className="ss-next-step__meta">On track</div>
            </div>
            <span className="ss-badge">Up next</span>
          </div>
        )}
      </div>
    </div>
  );
}
