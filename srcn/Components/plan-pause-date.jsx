import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import { pauseEvent, pausePlan } from "./api";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PlanPauseDate() {
  const { scope, id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!returnDate) {
      setError("Pick a return date.");
      return;
    }

    const chosen = new Date(`${returnDate}T00:00:00`);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysOut = (chosen - today) / 86400000;

    if (daysOut <= 0) {
      setError("Return date can't be in the past.");
      return;
    }
    if (daysOut > 90) {
      setError("That's more than 90 days out — pick a closer date, or adjust the schedule instead.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (scope === "course") {
        await pausePlan(user.token, id, returnDate);
      } else {
        await pauseEvent(user.token, id, returnDate);
      }
      navigate(`/plan/pause/${scope}/${id}/confirm?date=${returnDate}`);
    } catch (err) {
      setError(err.message || "We couldn't pause this right now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to={`/plan/pause/${scope}/${id}`} className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <div className="ss-page-header">
          <h1>When will you be back?</h1>
          <p className="ss-page-header__sub">Progress stays exactly as it is until then.</p>
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
          <button type="submit" className="ss-btn-primary" disabled={saving}>
            {saving ? "Saving..." : scope === "course" ? "Pause this course" : "Pause this activity"}
          </button>
        </form>
      </div>
    </div>
  );
}
