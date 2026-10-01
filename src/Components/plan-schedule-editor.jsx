import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser } from "../user-context";
import { WEEKDAYS, daysPatternToList } from "./course-utils";
import { adjustPlanSchedule, getEvent, getPlan, resumeEvent, resumePlan, updateEvent } from "./api";

function dayName(date) {
  return WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
}

function moveToWeekday(dateValue, weekday) {
  const current = new Date(dateValue);
  const currentDay = current.getDay();
  const targetDay = WEEKDAYS.indexOf(weekday) + 1;
  const normalizedTarget = targetDay === 7 ? 0 : targetDay;
  let delta = normalizedTarget - currentDay;
  if (delta < 0) delta += 7;
  const next = new Date(current);
  next.setDate(next.getDate() + delta);
  return next;
}

function dateInputValue(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PlanScheduleEditor() {
  const { scope, id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [event, setEvent] = useState(null);
  const [weeklyTime, setWeeklyTime] = useState("3 hours");
  const [days, setDays] = useState("Tue / Thu / Sat");
  const [scheduledDay, setScheduledDay] = useState("Monday");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.token || !id) return;
      try {
        if (scope === "course") {
          const data = await getPlan(user.token, id);
          if (!cancelled) {
            setPlan(data);
            setWeeklyTime(data?.weeklyTime || "3 hours");
            const selected = data?.daysOfWeek || [];
            const pattern = ["Tue / Thu / Sat", "Mon / Wed / Fri", "Weekends only", "Every day"].find((value) => {
              const values = daysPatternToList(value);
              return values.length === selected.length && values.every((day) => selected.includes(day));
            });
            setDays(pattern || "Tue / Thu / Sat");
          }
        } else {
          const data = await getEvent(user.token, id);
          if (!cancelled) {
            setEvent(data);
            setScheduledDay(dayName(new Date(data.scheduledDate)));
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "We couldn't load this schedule.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.token, scope, id]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (scope === "course") {
        await adjustPlanSchedule(user.token, id, {
          daysOfWeek: daysPatternToList(days),
          activities: plan?.activities || [],
          weeklyTime,
          endDate: plan?.endDate || undefined,
        });
        if (plan?.status === "paused") await resumePlan(user.token, id);
      } else {
        const movedDate = moveToWeekday(event.scheduledDate, scheduledDay);
        await updateEvent(user.token, id, {
          scheduledDate: dateInputValue(movedDate),
          scheduledTime: event.scheduledTime || undefined,
          estimatedMinutes: event.estimatedMinutes,
          title: event.title,
        });
        await resumeEvent(user.token, id);
      }
      navigate(`/plan/pause/${scope}/${id}/preview`);
    } catch (err) {
      setError(err.message || "We couldn't update the schedule.");
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
          <h1>{scope === "course" ? "Adjust this course's schedule" : "Move this activity"}</h1>
          <p className="ss-page-header__sub">Activities and progress carry over untouched.</p>
        </div>

        <form onSubmit={submit}>
          {scope === "course" ? (
            <>
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
            </>
          ) : (
            <div className="ss-field">
              <label htmlFor="sched-day">Which day should this happen?</label>
              <select id="sched-day" value={scheduledDay} onChange={(e) => setScheduledDay(e.target.value)}>
                {WEEKDAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
          {error && <div className="ss-field__error">{error}</div>}
          <button type="submit" className="ss-btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
