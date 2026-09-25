import { useState } from "react";
import "../App.css";

const TOTAL_STEPS = 6;

export default function Onboarding({ onSubmit = () => {} }) {
  const [step, setStep] = useState(1);

  const [goal, setGoal] = useState("");
  const [why, setWhy] = useState("");
  const [programme, setProgramme] = useState("");
  const [activities, setActivities] = useState([]);
  const [activityDraft, setActivityDraft] = useState("");
  const [weeklyTime, setWeeklyTime] = useState("3 hours");
  const [days, setDays] = useState("Tue / Thu / Sat");
  const [reminderDays, setReminderDays] = useState({ Tuesday: true, Thursday: true, Saturday: true });
  const [error, setError] = useState("");

  function next() {
    setError("");
    if (step === 1 && !goal.trim()) {
      setError("Tell us what you're learning.");
      return;
    }
    if (step === 3 && activities.length === 0) {
      setError("Add at least one activity.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  function addActivity(e) {
    e.preventDefault();
    if (!activityDraft.trim()) return;
    setActivities((a) => [...a, activityDraft.trim()]);
    setActivityDraft("");
    setError("");
  }

  function removeActivity(i) {
    setActivities((a) => a.filter((_, idx) => idx !== i));
  }

  function finish(startNow) {
    onSubmit({ goal, why, programme, activities, weeklyTime, days, reminderDays, startNow });
  }

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="ss-onboarding">
      <div className="ss-onboarding-card">
        <div className="ss-onboarding-progress">
          <div className="ss-onboarding-progress__fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="ss-onboarding-card__step">Step {step} of {TOTAL_STEPS}</p>

        {step === 1 && (
          <>
            <h1>Set your learning goal</h1>
            <p className="ss-onboarding-card__sub">A clear goal keeps you focused even when life gets busy.</p>
            <div className={error ? "ss-field ss-field--error" : "ss-field"}>
              <label htmlFor="ob-goal">What are you learning? *</label>
              <input
                id="ob-goal"
                type="text"
                placeholder="e.g. Complete UX Design course"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              {error && <div className="ss-field__error">{error}</div>}
            </div>
            <div className="ss-field">
              <label htmlFor="ob-why">Why does this matter to you? (optional)</label>
              <textarea
                id="ob-why"
                placeholder="e.g. I want to switch careers into UX..."
                value={why}
                onChange={(e) => setWhy(e.target.value)}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Which course or programme?</h1>
            <p className="ss-onboarding-card__sub">So we know where your activities live.</p>
            <div className="ss-field">
              <label htmlFor="ob-programme">Course / platform</label>
              <input
                id="ob-programme"
                type="text"
                placeholder="e.g. React course on Udemy"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
              />
              <div className="ss-field__hint">Optional — you can skip this and fill it in later.</div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Add your learning activities</h1>
            <p className="ss-onboarding-card__sub">Break your course into small, manageable steps.</p>
            {activities.length > 0 && (
              <ul className="ss-onboarding-activities">
                {activities.map((a, i) => (
                  <li key={i}>
                    <span>{a}</span>
                    <button type="button" onClick={() => removeActivity(i)} aria-label={`Remove ${a}`}>×</button>
                  </li>
                ))}
              </ul>
            )}
            <form className="ss-onboarding-add-row" onSubmit={addActivity}>
              <input
                type="text"
                placeholder="e.g. Week 1 Videos"
                value={activityDraft}
                onChange={(e) => setActivityDraft(e.target.value)}
              />
              <button type="submit" className="ss-btn-primary ss-btn-primary--compact">Add</button>
            </form>
            {error && <div className="ss-field__error" style={{ marginBottom: 12 }}>{error}</div>}
          </>
        )}

        {step === 4 && (
          <>
            <h1>Set your available learning time</h1>
            <p className="ss-onboarding-card__sub">A realistic pace is easier to stick with.</p>
            <div className="ss-field">
              <label htmlFor="ob-time">Weekly time</label>
              <select id="ob-time" value={weeklyTime} onChange={(e) => setWeeklyTime(e.target.value)}>
                <option>1 hour</option>
                <option>3 hours</option>
                <option>5 hours</option>
                <option>10+ hours</option>
              </select>
            </div>
            <div className="ss-field">
              <label htmlFor="ob-days">Which days usually work?</label>
              <select id="ob-days" value={days} onChange={(e) => setDays(e.target.value)}>
                <option>Tue / Thu / Sat</option>
                <option>Mon / Wed / Fri</option>
                <option>Weekends only</option>
                <option>Every day</option>
              </select>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1>Your plan is ready</h1>
            <p className="ss-onboarding-card__sub">Here's what we've put together for you.</p>
            <div className="ss-card" style={{ marginBottom: 20 }}>
              <p className="ss-eyebrow ss-eyebrow--teal" style={{ marginBottom: 6 }}>Goal</p>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{goal || "—"}</p>
              <p style={{ fontSize: 12.5, color: "var(--ss-stone)" }}>{days} · {weeklyTime}</p>
            </div>
            <p className="ss-section-label">First {Math.min(5, activities.length)} activities</p>
            <ol className="ss-onboarding-preview-list">
              {activities.slice(0, 5).map((a, i) => (
                <li key={i}>
                  <span className="num">{i + 1}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {step === 6 && (
          <>
            <h1>Set up reminders</h1>
            <p className="ss-onboarding-card__sub">Optional — you can turn these off any time in Settings.</p>
            <div className="ss-day-picker">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, i) => (
                <button
                  key={day}
                  type="button"
                  className={reminderDays[day] ? "ss-day-picker__day--on" : ""}
                  onClick={() => setReminderDays((prev) => ({ ...prev, [day]: !prev[day] }))}
                  aria-label={day}
                >
                  {"MTWTFSS"[i]}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="ss-onboarding-nav">
          {step > 1 && (
            <button type="button" className="ss-btn-secondary" onClick={back}>
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" className="ss-btn-primary" onClick={next}>
              Next
            </button>
          ) : (
            <>
              <button type="button" className="ss-btn-secondary" onClick={() => finish(false)}>
                Skip
              </button>
              <button type="button" className="ss-btn-primary" onClick={() => finish(true)}>
                Save and start
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
