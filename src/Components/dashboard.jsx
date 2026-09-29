import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import {
  getAllTasksFlat,
  getWaitingTasks,
  todayWeekday,
  isPaused,
  findCourse,
  courseStats,
  splitByTimeBudget,
} from "./course-utils";
import AddCourseForm from "./add-course-form";

const INACTIVITY_DAYS_THRESHOLD = 7;

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function computeVariant(user) {
  const courses = user?.courses || [];
  const allTasks = getAllTasksFlat(courses);
  const completed = allTasks.filter((t) => t.status === "completed").length;

  if (!user?.hasVisitedDashboard) return "first-time";
  if (allTasks.length > 0 && completed === allTasks.length) return "plan-complete";

  if (user?.lastActiveAt) {
    const daysSince = (Date.now() - new Date(user.lastActiveAt).getTime()) / 86400000;
    if (daysSince >= INACTIVITY_DAYS_THRESHOLD && getWaitingTasks(courses).length > 0) return "catch-up";
  }
  return "normal";
}

function TaskRow({ task }) {
  return (
    <li className="ss-list-row ss-plan-item">
      <Link
        to={`/plan/${task.id}`}
        className={task.status === "completed" ? "ss-plan-item__title ss-plan-item__title--done" : "ss-plan-item__title"}
      >
        {task.title}
      </Link>
      <span className="ss-plan-item__status-label">
        {task.estimatedMinutes || 30}m · {task.courseTitle}
      </span>
    </li>
  );
}

export default function Dashboard() {
  const { user, setUser } = useUser();
  const courses = user?.courses || [];
  const allTasks = getAllTasksFlat(courses);
  const completed = allTasks.filter((t) => t.status === "completed").length;
  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  const [variant] = useState(() => computeVariant(user));
  const [catchupDismissed, setCatchupDismissed] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [minutesAvailable, setMinutesAvailable] = useState("");

  useEffect(() => {
    setUser((prev) => ({
      ...prev,
      hasVisitedDashboard: true,
      lastActiveAt: new Date().toISOString(),
      catchupNeeded: variant === "catch-up" ? true : prev?.catchupNeeded,
    }));
  }, []);

  function addCourse(course) {
    setUser((prev) => ({ ...prev, courses: [...(prev?.courses || []), course] }));
    setAddingCourse(false);
  }

  const today = todayWeekday();
  const todaysAll = allTasks.filter(
    (t) => t.scheduledDay === today && !isPaused(findCourse(courses, t.courseId), t)
  );
  const todaysPending = todaysAll.filter((t) => t.status !== "completed");
  const todaysDone = todaysAll.filter((t) => t.status === "completed");
  const minutesLeft = todaysPending.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);

  const budget = Number(minutesAvailable) || 0;
  const { fits, later } = splitByTimeBudget(todaysPending, budget);
  const shortest = todaysPending.length
    ? Math.min(...todaysPending.map((t) => t.estimatedMinutes || 30))
    : 0;

  const courseList = (
    <div className="ss-page__section">
      <div className="ss-courses-header">
        <p className="ss-plan-section-title">Your courses</p>
        <button type="button" className="ss-btn-link" onClick={() => setAddingCourse((v) => !v)}>
          {addingCourse ? "Cancel" : "+ Add course"}
        </button>
      </div>

      {addingCourse && (
        <div className="ss-card ss-page__section">
          <AddCourseForm onSave={addCourse} onCancel={() => setAddingCourse(false)} />
        </div>
      )}

      {courses.length === 0 ? (
        <p className="ss-empty-state">No courses yet — add one to get started.</p>
      ) : (
        <ul className="ss-course-list">
          {courses.map((course) => {
            const { total, completed: done } = courseStats(course);
            return (
              <li key={course.id}>
                <Link to={`/plan#${course.id}`} className="ss-course-row">
                  <div>
                    <div className="ss-course-row__title">{course.title}</div>
                    <div className="ss-course-row__provider">{course.provider || "—"}</div>
                  </div>
                  <div className="ss-course-row__meta">
                    {isPaused(course) ? (
                      <span className="ss-badge ss-badge--attention">Paused</span>
                    ) : (
                      <span className="ss-badge">{done}/{total}</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const todaysActivities = (
    <div className="ss-card">
      <p className="ss-plan-section-title">Today's activities · {today}</p>

      {todaysAll.length > 0 && (
        <p className="ss-todays-summary">
          {todaysDone.length} of {todaysAll.length} done today
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

      {todaysAll.length === 0 && (
        <p className="ss-empty-state">Nothing scheduled for today — enjoy the breathing room.</p>
      )}

      {todaysAll.length > 0 && todaysPending.length === 0 && (
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
              {fits.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}
          {budget > 0 && later.length > 0 && (
            <>
              <p className="ss-eyebrow ss-eyebrow--spaced">Also today, if you find more time</p>
              <ul className="ss-plan-list">
                {later.map((t) => (
                  <TaskRow key={t.id} task={t} />
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
            {todaysDone.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        </>
      )}
    </div>
  );

  if (variant === "first-time") {
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">Welcome</p>
          <h1 className="ss-dashboard__greeting">{firstName}</h1>
          {courseList}
          {courses.length > 0 && todaysActivities}
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
            <p>You finished every activity across every course. That's real, steady progress.</p>
            <button type="button" className="ss-btn-secondary" onClick={() => setAddingCourse(true)}>
              Add a new course
            </button>
          </div>
          {courseList}
        </div>
      </div>
    );
  }

  if (variant === "catch-up" && !catchupDismissed) {
    const waiting = getWaitingTasks(courses).length;
    return (
      <div className="ss-page">
        <div className="ss-page__inner">
          <p className="ss-dashboard__greeting-label">Welcome back</p>
          <h1 className="ss-dashboard__greeting">{firstName}</h1>
          <div className="ss-card ss-catchup-card">
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
          {courseList}
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
        {courses.length > 0 && todaysActivities}
      </div>
    </div>
  );
}
