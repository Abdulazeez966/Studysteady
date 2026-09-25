import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

export default function PlanScheduleEditor() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [weeklyTime, setWeeklyTime] = useState(user?.weeklyTime ?? "3 hours");
  const [days, setDays] = useState(user?.days ?? "Tue / Thu / Sat");

  function submit(e) {
    e.preventDefault();
    setUser((prev) => ({ ...prev, weeklyTime, days, paused: false }));
    navigate("/plan/pause/preview");
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/plan/pause" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <div className="ss-page-header">
          <h1>Adjust your schedule</h1>
          <p className="ss-page-header__sub">Change your pace — your activities and progress carry over untouched.</p>
        </div>

        <form onSubmit={submit}>
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
          <button type="submit" className="ss-btn-primary">
            Save new schedule
          </button>
        </form>
      </div>
    </div>
  );
}
