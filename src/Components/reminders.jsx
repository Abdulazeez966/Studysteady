import { useState } from "react";
import { useUser } from "../user-context";
import "../App.css";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ABBREV_TO_FULL = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function defaultReminderDays(days) {
  const map = Object.fromEntries(WEEKDAYS.map((d) => [d, false]));
  if (!days) return map;
  days
    .split("/")
    .map((s) => s.trim())
    .forEach((abbr) => {
      const full = ABBREV_TO_FULL[abbr];
      if (full) map[full] = true;
    });
  return map;
}

export default function Reminders() {
  const { user, setUser } = useUser();

  const [reminderDays, setReminderDays] = useState(
    user?.reminderDays ?? defaultReminderDays(user?.days)
  );
  const [saved, setSaved] = useState(false);

  function toggleDay(day) {
    setReminderDays((prev) => ({ ...prev, [day]: !prev[day] }));
    setSaved(false);
  }

  function save() {
    setUser((prev) => ({ ...prev, reminderDays }));
    setSaved(true);
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <p className="ss-page-header__eyebrow">Reminders</p>
          <h1>You're in control of when we reach out</h1>
          <p className="ss-page-header__sub">Choose the days that fit your routine.</p>
        </div>

        <div className="ss-task-card">
          <ul className="ss-reminders-list">
            {WEEKDAYS.map((day) => (
              <li key={day} className="ss-reminders-row">
                <span className="ss-reminders-row__label">{day}</span>
                <button
                  type="button"
                  className={reminderDays[day] ? "ss-toggle ss-toggle--on" : "ss-toggle"}
                  role="switch"
                  aria-checked={reminderDays[day]}
                  aria-label={`Reminders on ${day}`}
                  onClick={() => toggleDay(day)}
                >
                  <span className="ss-toggle__dot" />
                </button>
              </li>
            ))}
          </ul>

          <p className="ss-reminders-note">
            We send one reminder per active day, and never for a task you've already completed.
          </p>

          <button type="button" className="ss-btn-primary ss-btn-primary--compact" onClick={save}>
            Save preferences
          </button>
          {saved && <span className="ss-inline-saved">Preferences saved.</span>}
        </div>
      </div>
    </div>
  );
}
