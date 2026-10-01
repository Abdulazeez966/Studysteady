import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../user-context";
import { getActivities, getEvent, getEvents, getPlan } from "./api";
import { WEEKDAYS } from "./course-utils";

function dayName(dateValue) {
  const date = new Date(dateValue);
  return WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
}

export default function PlanUpdatedPreview() {
  const { scope, id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [event, setEvent] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.token || !id) return;
      try {
        if (scope === "course") {
          const planData = await getPlan(user.token, id);
          const [eventsData, activitiesData] = await Promise.all([
            getEvents(user.token, { planId: id }),
            getActivities(user.token, { planId: id }),
          ]);
          const activities = Array.isArray(activitiesData) ? activitiesData : [];
          const completedEvents = new Set(activities.filter((activity) => activity.status === "completed").map((activity) => String(activity.event?._id || activity.event)));
          const events = Array.isArray(eventsData) ? eventsData : [];
          const count = events.filter((item) => !completedEvents.has(String(item._id || item.id))).length;
          if (!cancelled) {
            setPlan(planData);
            setRemaining(count);
          }
        } else {
          const eventData = await getEvent(user.token, id);
          if (!cancelled) setEvent(eventData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "We couldn't load the updated schedule.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.token, scope, id]);

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <h1>{scope === "course" ? "Your updated schedule" : "Activity moved"}</h1>
          <p className="ss-page-header__sub">Here's how things look now.</p>
        </div>

        <div className="ss-preview-summary">
          {scope === "course" ? (
            <>
              <div className="ss-preview-summary__row">
                <span>Weekly time</span>
                <span>{plan?.weeklyTime || "—"}</span>
              </div>
              <div className="ss-preview-summary__row">
                <span>Days</span>
                <span>{(plan?.daysOfWeek || []).join(" / ") || "—"}</span>
              </div>
              <div className="ss-preview-summary__row">
                <span>Activities remaining</span>
                <span>{remaining}</span>
              </div>
            </>
          ) : (
            <div className="ss-preview-summary__row">
              <span>Now scheduled for</span>
              <span>{event?.scheduledDate ? dayName(event.scheduledDate) : "—"}</span>
            </div>
          )}
        </div>

        {error && <div className="ss-field__error">{error}</div>}
        <button type="button" className="ss-btn-primary" onClick={() => navigate("/plan")}>
          Continue
        </button>
      </div>
    </div>
  );
}
