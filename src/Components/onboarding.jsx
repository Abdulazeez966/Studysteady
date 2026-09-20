import { useState } from "react";
import "../App.css";

export default function Onboarding({ onSubmit = () => {} }) {
  const [goal, setGoal] = useState("");
  const [weeklyTime, setWeeklyTime] = useState("3 hours");
  const [days, setDays] = useState("Tue / Thu / Sat");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!goal.trim()) {
      setError("Tell us what you want to learn.");
      return;
    }
    setError("");
    onSubmit({ goal, weeklyTime, days });
  }

  return (
    <div className="ss-onboarding">
      <div className="ss-onboarding-card">
        <div className="ss-onboarding-card__step">Step 1 of 1</div>
        <h1>What do you want to learn?</h1>
        <p className="ss-onboarding-card__sub">
          Tell us your goal and available time, and we'll build a realistic plan around it.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={error ? "ss-field ss-field--error" : "ss-field"}>
            <label htmlFor="onboarding-goal">Your learning goal</label>
            <input
              id="onboarding-goal"
              type="text"
              placeholder="e.g. React course on Udemy"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            {error && <div className="ss-field__error">{error}</div>}
          </div>

          <div className="ss-field">
            <label htmlFor="onboarding-time">How much time can you give this, per week?</label>
            <select
              id="onboarding-time"
              value={weeklyTime}
              onChange={(e) => setWeeklyTime(e.target.value)}
            >
              <option>1 hour</option>
              <option>3 hours</option>
              <option>5 hours</option>
              <option>10+ hours</option>
            </select>
          </div>

          <div className="ss-field">
            <label htmlFor="onboarding-days">Which days usually work?</label>
            <select
              id="onboarding-days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            >
              <option>Tue / Thu / Sat</option>
              <option>Mon / Wed / Fri</option>
              <option>Weekends only</option>
              <option>Every day</option>
            </select>
          </div>

          <button type="submit" className="ss-btn-primary">
            Create my plan
          </button>
        </form>
      </div>
    </div>
  );
}
