import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUser } from "../user-context";
import { getEvent, getGoal, getPlan } from "./api";

export default function PlanPauseChoice() {
  const { scope, id } = useParams();
  const { user } = useUser();
  const [label, setLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.token || !id) return;
      try {
        if (scope === "course") {
          const plan = await getPlan(user.token, id);
          const goalId = plan?.goal?._id || plan?.goal?.id || plan?.goal;
          const goal = goalId ? await getGoal(user.token, goalId) : null;
          if (!cancelled) setLabel(goal?.subject || "Course");
        } else {
          const event = await getEvent(user.token, id);
          if (!cancelled) setLabel(event?.title || "Activity");
        }
      } catch {
        if (!cancelled) setLabel(scope === "course" ? "Course" : "Activity");
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
        <Link to="/plan" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Plan
        </Link>
        <div className="ss-page-header">
          <h1>Pause or adjust {scope === "course" ? "this course" : "this activity"}</h1>
          <p className="ss-page-header__sub">
            {label ? `"${label}" — ` : ""}Life changes — your plan can too. Nothing here loses your progress.
          </p>
        </div>

        <div className="ss-pause-choice">
          <Link to={`/plan/pause/${scope}/${id}/date`} className="ss-pause-choice__card">
            <h3>Pause {scope === "course" ? "this course" : "this activity"}</h3>
            <p>Take a break until a date you choose. We'll wait for you.</p>
          </Link>
          <Link to={`/plan/pause/${scope}/${id}/schedule`} className="ss-pause-choice__card">
            <h3>Adjust the schedule</h3>
            <p>Change the weekly time or preferred days going forward.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
