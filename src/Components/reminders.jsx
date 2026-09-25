import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ABBREV_TO_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};

function defaultReminderDays(days) {
  const map = Object.fromEntries(WEEKDAYS.map((d) => [d, false]));
  if (!days) return map;
  days.split("/").map((s) => s.trim()).forEach((abbr) => {
    const full = ABBREV_TO_FULL[abbr];
    if (full) map[full] = true;
  });
  return map;
}

export default function Reminders() {
  const { user, setUser } = useUser();

  const [enabled, setEnabled] = useState(user?.remindersEnabled ?? true);
  const [reminderDays, setReminderDays] = useState(user?.reminderDays ?? defaultReminderDays(user?.days));
  const [timeOfDay, setTimeOfDay] = useState(user?.reminderTime ?? "Evening");
  const [saved, setSaved] = useState(false);

  function toggleDay(day) {
    setReminderDays((prev) => ({ ...prev, [day]: !prev[day] }));
    setSaved(false);
  }

  function save() {
    setUser((prev) => ({ ...prev, remindersEnabled: enabled, reminderDays, reminderTime: timeOfDay }));
    setSaved(true);
  }

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
          <h1>Reminder Settings</h1>
        </div>

        <div className="ss-reminder-toggle-card">
          <div>
            <h3>Enable reminders</h3>
            <p>Get notified before your sessions</p>
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
              aria-pressed={reminderDays[day]}
            >
              {DAY_LETTERS[i]}
            </button>
          ))}
        </div>

        <p className="ss-section-label">Time of day</p>
        <div className="ss-time-picker">
          {["Morning", "Afternoon", "Evening"].map((opt) => (
            <button
              key={opt}
              type="button"
              className={timeOfDay === opt ? "ss-time-picker__opt--on" : ""}
              onClick={() => { setTimeOfDay(opt); setSaved(false); }}
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="ss-reminders-note">Reminders help, but you're in control. Adjust these any time.</p>

        <button type="button" className="ss-btn-primary" onClick={save}>
          Save preferences
        </button>
        {saved && <div className="ss-inline-saved" style={{ display: "block", textAlign: "center", marginTop: 10, marginLeft: 0 }}>Preferences saved.</div>}
      </div>
    </div>
  );
}
