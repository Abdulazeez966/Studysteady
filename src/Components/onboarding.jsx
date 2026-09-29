import { useState } from "react";
import { WEEKDAYS, daysPatternToList, uid } from "./course-utils";

const TOTAL_STEPS = 6;

export default function Onboarding({ onSubmit = () => {} }) {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(1);

  const [goal, setGoal] = useState("");
  const [why, setWhy] = useState("");
  const [programme, setProgramme] = useState("");
  const [activities, setActivities] = useState([]);
  const [activityDraft, setActivityDraft] = useState("");
  const [minutesDraft, setMinutesDraft] = useState("30");
  const [weeklyTime, setWeeklyTime] = useState("3 hours");
  const [days, setDays] = useState("Tue / Thu / Sat");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState({ Tuesday: true, Thursday: true, Saturday: true });
  const [reminderTime, setReminderTime] = useState("Evening");
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
    setActivities((a) => [...a, { title: activityDraft.trim(), minutes: Number(minutesDraft) >= 5 ? Number(minutesDraft) : 30 }]);
    setActivityDraft("");
    setMinutesDraft("30");
    setError("");
  }

  function removeActivity(i) {
    setActivities((a) => a.filter((_, idx) => idx !== i));
  }

  function finish(startNow) {
    const dayList = daysPatternToList(days);
    const tasks = activities.map((a, i) => ({
      id: uid("task"),
      title: a.title,
      status: "pending",
      scheduledDay: dayList[i % dayList.length],
      estimatedMinutes: a.minutes,
    }));
    const course = {
      id: uid("course"),
      title: goal,
      provider: programme,
      why,
      weeklyTime,
      days,
      paused: false,
      pauseReturnDate: null,
      reminderOverride: startNow
        ? { enabled: remindersEnabled, days: reminderDays, time: reminderTime }
        : null,
      tasks,
    };
    onSubmit({ course, startNow });
  }

  if (showIntro) {
    return (
      <div className="ss-onboarding">
        <div className="ss-card ss-onboarding-card">
          <div className="ss-onboarding-intro">
            <h1>Let's set up your plan</h1>
            <p>A few quick steps — your goal, your activities, and how much time you've got. Takes about a minute.</p>
            <button type="button" className="ss-btn-primary" onClick={() => setShowIntro(false)}>
              Let's set up your plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="ss-onboarding">
      <div className="ss-card ss-onboarding-card">
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
                  <li key={i} className="ss-list-row">
                    <span>{a.title} · {a.minutes}m</span>
                    <button type="button" onClick={() => removeActivity(i)} aria-label={`Remove ${a.title}`}>×</button>
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
              <input
                type="number"
                min="5"
                step="5"
                className="ss-plan-add__minutes"
                aria-label="Minutes for this activity"
                value={minutesDraft}
                onChange={(e) => setMinutesDraft(e.target.value)}
              />
              <button type="submit" className="ss-btn-primary ss-btn-primary--compact">Add</button>
            </form>
            {error && <div className="ss-field__error ss-standalone-error">{error}</div>}
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
            <div className="ss-card ss-onboarding-preview-card">
              <p className="ss-eyebrow ss-eyebrow--teal ss-eyebrow--spaced">Goal</p>
              <p className="ss-onboarding-preview-goal-name">{goal || "—"}</p>
              <p className="ss-onboarding-preview-goal-meta">{days} · {weeklyTime}</p>
            </div>
            <p className="ss-section-label">First {Math.min(5, activities.length)} activities</p>
            <ol className="ss-onboarding-preview-list">
              {activities.slice(0, 5).map((a, i) => (
                <li key={i}>
                  <span className="num">{i + 1}</span>
                  <span>{a.title} · {a.minutes}m</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {step === 6 && (
          <>
            <h1>Set up reminders</h1>
            <p className="ss-onboarding-card__sub">Optional — you can change these any time in Settings.</p>

            <div className="ss-reminder-toggle-card">
              <div>
                <h3>Enable reminders</h3>
                <p>Get notified before your sessions</p>
              </div>
              <button
                type="button"
                className={remindersEnabled ? "ss-toggle ss-toggle--on" : "ss-toggle"}
                role="switch"
                aria-checked={remindersEnabled}
                onClick={() => setRemindersEnabled((v) => !v)}
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
                  onClick={() => setReminderDays((prev) => ({ ...prev, [day]: !prev[day] }))}
                  aria-label={day}
                  disabled={!remindersEnabled}
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
                  onClick={() => setReminderTime(opt)}
                  disabled={!remindersEnabled}
                >
                  {opt}
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
