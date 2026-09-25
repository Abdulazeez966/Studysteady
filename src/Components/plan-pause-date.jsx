import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PlanPauseDate() {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!returnDate) {
      setError("Pick a return date.");
      return;
    }
    const chosen = new Date(returnDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysOut = (chosen - now) / 86400000;

    if (daysOut < 0) {
      setError("Return date can't be in the past.");
      return;
    }
    if (daysOut > 90) {
      setError("That's more than 90 days out — pick a closer date, or adjust your schedule instead.");
      return;
    }

    setUser((prev) => ({ ...prev, paused: true, pauseReturnDate: returnDate }));
    navigate("/plan/pause/confirm");
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
          <h1>When will you be back?</h1>
          <p className="ss-page-header__sub">Your plan and progress stay exactly as they are until then.</p>
        </div>

        <form onSubmit={submit} noValidate>
          <div className={error ? "ss-field ss-field--error" : "ss-field"}>
            <label htmlFor="return-date">Return date</label>
            <input
              id="return-date"
              type="date"
              min={todayISO()}
              value={returnDate}
              onChange={(e) => { setReturnDate(e.target.value); setError(""); }}
            />
            {error && <div className="ss-field__error">{error}</div>}
          </div>
          <button type="submit" className="ss-btn-primary">
            Pause my plan
          </button>
        </form>
      </div>
    </div>
  );
}
