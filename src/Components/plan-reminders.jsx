import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import { WEEKDAYS, findCourse, findTask, effectiveReminders } from "./course-utils";

export default function PlanReminders() {
  const { scope, id } = useParams();
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const courses = user?.courses || [];

  const course = scope === "course" ? findCourse(courses, id) : findTask(courses, id)?.course;
  const task = scope === "task" ? findTask(courses, id)?.task : null;
  const current = effectiveReminders(course, task, user);

  const [enabled, setEnabled] = useState(current.enabled);
  const [reminderDays, setReminderDays] = useState(current.days || {});
  const [reminderTime, setReminderTime] = useState(current.time || "Evening");
  const [saved, setSaved] = useState(false);

  function toggleDay(day) {
    setReminderDays((prev) => ({ ...prev, [day]: !prev[day] }));
    setSaved(false);
  }

  function save() {
    const override = { enabled, days: reminderDays, time: reminderTime };
    setUser((prev) => {
      const cs = prev.courses || [];
      if (scope === "course") {
        return { ...prev, courses: cs.map((c) => (c.id === id ? { ...c, reminderOverride: override } : c)) };
      }
      return {
        ...prev,
        courses: cs.map((c) => ({
          ...c,
          tasks: (c.tasks || []).map((t) => (t.id === id ? { ...t, reminderOverride: override } : t)),
        })),
      };
    });
    setSaved(true);
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/plan" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Plan
        </Link>
        <div className="ss-page-header">
          <h1>Reminders for {scope === "course" ? course?.title : task?.title}</h1>
          <p className="ss-page-header__sub">
            These settings apply only to {scope === "course" ? "this course" : "this activity"} — your account
            default in Settings is unaffected.
          </p>
        </div>

        <div className="ss-reminder-toggle-card">
          <div>
            <h3>Enable reminders</h3>
            <p>Get notified before this {scope === "course" ? "course's sessions" : "activity"}</p>
          </div>
          <button
            type="button"
            className={enabled ? "ss-toggle ss-toggle--on" : "ss-toggle"}
            role="switch"
            aria-checked={enabled}
            onClick={() => { setEnabled((v) => !v); setSaved(false); }}
          >
            <span className="ss-toggle__dot" />
          </button>
        </div>

        <p className="ss-section-label">Remind me on</p>
        <div className="ss-day-picker">
          {WEEKDAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              className={reminderDays[day] ? "ss-day-picker__day--on" : ""}
              onClick={() => toggleDay(day)}
              aria-label={day}
              disabled={!enabled}
            >
              {"MTWTFSS"[i]}
            </button>
          ))}
        </div>

        <p className="ss-section-label">Time of day</p>
        <div className="ss-segmented">
          {["Morning", "Afternoon", "Evening"].map((opt) => (
            <button
              key={opt}
              type="button"
              className={reminderTime === opt ? "ss-segmented__opt--on" : ""}
              onClick={() => { setReminderTime(opt); setSaved(false); }}
              disabled={!enabled}
            >
              {opt}
            </button>
          ))}
        </div>

        <button type="button" className="ss-btn-primary" onClick={save}>
          Save preferences
        </button>
        {saved && <div className="ss-inline-saved ss-inline-saved--block">Saved.</div>}
        <button type="button" className="ss-btn-link" style={{ display: "block", textAlign: "center", marginTop: 14 }} onClick={() => navigate("/plan")}>
          Back to Plan
        </button>
      </div>
    </div>
  );
}
