import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import { getAccountReminders, updateAccountReminders } from "./api";
import { WEEKDAYS, normalizeReminder, reminderMapToList, reminderTimeToValue } from "./course-utils";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default function Reminders() {
  const { user } = useUser();
  const token = user?.token;
  const [enabled, setEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState({});
  const [timeOfDay, setTimeOfDay] = useState("Evening");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const data = await getAccountReminders(token);
        if (!active) return;
        const reminder = normalizeReminder(data);
        setEnabled(reminder.enabled);
        setReminderDays(reminder.days);
        setTimeOfDay(reminder.time);
      } catch (err) {
        if (active) setError(err?.message || "We couldn't load your reminder preferences.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [token]);

  function toggleDay(day) {
    setReminderDays((prev) => ({ ...prev, [day]: !prev[day] }));
    setSaved(false);
  }

  async function save() {
    if (!token || saving) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const data = await updateAccountReminders(token, {
        enabled,
        days: enabled ? reminderMapToList(reminderDays) : [],
        time: enabled ? reminderTimeToValue(timeOfDay) : null,
      });
      const reminder = normalizeReminder(data);
      setEnabled(reminder.enabled);
      setReminderDays(reminder.days);
      setTimeOfDay(reminder.time);
      setSaved(true);
    } catch (err) {
      setError(err?.message || "We couldn't save your reminder preferences.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="ss-page"><div className="ss-page__inner"><p className="ss-empty-state">Loading reminder settings…</p></div></div>;
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

        {error && <div className="ss-field__error ss-standalone-error">{error}</div>}

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
              disabled={!enabled}
            >
              {DAY_LETTERS[i]}
            </button>
          ))}
        </div>

        <p className="ss-section-label">Time of day</p>
        <div className="ss-segmented">
          {["Morning", "Afternoon", "Evening"].map((opt) => (
            <button
              key={opt}
              type="button"
              className={timeOfDay === opt ? "ss-segmented__opt--on" : ""}
              onClick={() => { setTimeOfDay(opt); setSaved(false); }}
              disabled={!enabled}
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="ss-reminders-note">Reminders help, but you're in control. Adjust these any time.</p>

        <button type="button" className="ss-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </button>
        {saved && <div className="ss-inline-saved ss-inline-saved--block">Preferences saved.</div>}
      </div>
    </div>
  );
}
