import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import { getAccountReminders, getEvent, getGoal, getPlan, updateEventReminders, updatePlanReminders } from "./api";
import { WEEKDAYS, effectiveReminders, reminderMapToList, reminderTimeToValue } from "./course-utils";

export default function PlanReminders() {
  const { scope, id } = useParams();
  const { user } = useUser();
  const token = user?.token;
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [task, setTask] = useState(null);
  const [account, setAccount] = useState(null);
  const [goal, setGoal] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState({});
  const [reminderTime, setReminderTime] = useState("Evening");
  const [hasOverride, setHasOverride] = useState(false);
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
        const accountData = await getAccountReminders(token);
        let planData;
        let eventData = null;
        let goalData = null;
        if (scope === "course") {
          planData = await getPlan(token, id);
          const goalId = planData?.goal?._id || planData?.goal;
          if (goalId) goalData = await getGoal(token, goalId);
        } else if (scope === "task") {
          eventData = await getEvent(token, id);
          const planId = eventData?.plan?._id || eventData?.plan;
          if (!planId) throw new Error("This activity is not linked to a plan.");
          planData = await getPlan(token, planId);
          const goalId = planData?.goal?._id || planData?.goal || eventData?.goal?._id || eventData?.goal;
          if (goalId) goalData = await getGoal(token, goalId);
        } else {
          throw new Error("Unknown reminder scope.");
        }
        if (!active) return;
        const current = effectiveReminders(planData, eventData, accountData);
        setAccount(accountData);
        setCourse(planData);
        setTask(eventData);
        setGoal(goalData);
        setEnabled(current.enabled);
        setReminderDays(current.days || {});
        setReminderTime(current.time || "Evening");
        setHasOverride(scope === "course" ? planData?.reminderOverride != null : eventData?.reminderOverride != null);
      } catch (err) {
        if (active) setError(err?.message || "We couldn't load these reminder settings.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [token, scope, id]);

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
      const override = { enabled, days: enabled ? reminderMapToList(reminderDays) : [], time: enabled ? reminderTimeToValue(reminderTime) : null };
      const data = scope === "course"
        ? await updatePlanReminders(token, id, override)
        : await updateEventReminders(token, id, override);
      if (scope === "course") setCourse(data);
      else setTask(data);
      setHasOverride(true);
      setSaved(true);
    } catch (err) {
      setError(err?.message || "We couldn't save these reminder settings.");
    } finally {
      setSaving(false);
    }
  }

  async function clearOverride() {
    if (!token || saving) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const data = scope === "course"
        ? await updatePlanReminders(token, id, null)
        : await updateEventReminders(token, id, null);
      if (scope === "course") setCourse(data);
      else setTask(data);
      const current = effectiveReminders(
        scope === "course" ? data : course,
        scope === "task" ? data : task,
        account
      );
      setEnabled(current.enabled);
      setReminderDays(current.days || {});
      setReminderTime(current.time || "Evening");
      setHasOverride(false);
      setSaved(true);
    } catch (err) {
      setError(err?.message || "We couldn't clear this reminder override.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="ss-page"><div className="ss-page__inner"><p className="ss-empty-state">Loading reminder settings…</p></div></div>;
  }

  const title = scope === "course" ? (goal?.subject || "this course") : (task?.title || "this activity");

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
          <h1>Reminders for {title}</h1>
          <p className="ss-page-header__sub">
            These settings apply only to {scope === "course" ? "this course" : "this activity"} — your account
            default in Settings is unaffected.
          </p>
        </div>

        {error && <div className="ss-field__error ss-standalone-error">{error}</div>}

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

        <button type="button" className="ss-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </button>
        {hasOverride && (
          <button type="button" className="ss-btn-link" style={{ display: "block", textAlign: "center", marginTop: 14 }} onClick={clearOverride} disabled={saving}>
            Use default reminders
          </button>
        )}
        {saved && <div className="ss-inline-saved ss-inline-saved--block">Saved.</div>}
        <button type="button" className="ss-btn-link" style={{ display: "block", textAlign: "center", marginTop: 14 }} onClick={() => navigate("/plan")}>
          Back to Plan
        </button>
      </div>
    </div>
  );
}
