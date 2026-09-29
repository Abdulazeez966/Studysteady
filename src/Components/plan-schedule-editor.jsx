import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import { WEEKDAYS, findCourse, findTask } from "./course-utils";

export default function PlanScheduleEditor() {
  const { scope, id } = useParams();
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const courses = user?.courses || [];

  const course = scope === "course" ? findCourse(courses, id) : findTask(courses, id)?.course;
  const task = scope === "task" ? findTask(courses, id)?.task : null;

  const [weeklyTime, setWeeklyTime] = useState(course?.weeklyTime ?? "3 hours");
  const [days, setDays] = useState(course?.days ?? "Tue / Thu / Sat");
  const [scheduledDay, setScheduledDay] = useState(task?.scheduledDay ?? "Monday");

  function submit(e) {
    e.preventDefault();
    setUser((prev) => {
      const cs = prev.courses || [];
      if (scope === "course") {
        return { ...prev, courses: cs.map((c) => (c.id === id ? { ...c, weeklyTime, days, paused: false } : c)) };
      }
      return {
        ...prev,
        courses: cs.map((c) => ({
          ...c,
          tasks: (c.tasks || []).map((t) => (t.id === id ? { ...t, scheduledDay, paused: false } : t)),
        })),
      };
    });
    navigate(`/plan/pause/${scope}/${id}/preview`);
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to={`/plan/pause/${scope}/${id}`} className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <div className="ss-page-header">
          <h1>{scope === "course" ? "Adjust this course's schedule" : "Move this activity"}</h1>
          <p className="ss-page-header__sub">Activities and progress carry over untouched.</p>
        </div>

        <form onSubmit={submit}>
          {scope === "course" ? (
            <>
              <div className="ss-field">
                <label htmlFor="sched-time">Weekly time</label>
                <select id="sched-time" value={weeklyTime} onChange={(e) => setWeeklyTime(e.target.value)}>
                  <option>1 hour</option>
                  <option>3 hours</option>
                  <option>5 hours</option>
                  <option>10+ hours</option>
                </select>
              </div>
              <div className="ss-field">
                <label htmlFor="sched-days">Preferred days</label>
                <select id="sched-days" value={days} onChange={(e) => setDays(e.target.value)}>
                  <option>Tue / Thu / Sat</option>
                  <option>Mon / Wed / Fri</option>
                  <option>Weekends only</option>
                  <option>Every day</option>
                </select>
              </div>
            </>
          ) : (
            <div className="ss-field">
              <label htmlFor="sched-day">Which day should this happen?</label>
              <select id="sched-day" value={scheduledDay} onChange={(e) => setScheduledDay(e.target.value)}>
                {WEEKDAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="ss-btn-primary">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
