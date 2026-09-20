import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const defaultTrail = [
  { state: "done" },
  { state: "done" },
  { state: "done" },
  { state: "today" },
  { state: "upcoming" },
  { state: "upcoming" },
];

export default function Dashboard({
  userName = "Tunde",
  weekLabel = "Tuesday · Week 3",
  course = {
    title: "React Fundamentals",
    provider: "Udemy",
  },
  trail = defaultTrail,
  task = {
    title: "Watch Module 4 & do the exercise",
    meta: "~45 min · React fundamentals",
  },
  progressBase = 42,
  progressAfterComplete = 58,
  streakBase = 3,
  streakAfterComplete = 4,
}) {
  const [done, setDone] = useState(false);

  const progress = done ? progressAfterComplete : progressBase;
  const streak = done ? streakAfterComplete : streakBase;

  return (
    <div className="ss-dashboard">
      <div className="ss-dashboard__inner">
        <div className="ss-dashboard__header">
          <h1 className="ss-dashboard__greeting">Hey, {userName}</h1>
        </div>
        <p className="ss-dashboard__sub">{weekLabel}</p>

        <Link to="/plan" className="ss-dashboard__course">
          <span className="ss-dashboard__course-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 3.5C2 2.7 2.7 2 3.5 2H8V13H3.5C2.7 13 2 13.7 2 14V3.5Z"
                stroke="var(--ss-ink)"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <path
                d="M14 3.5C14 2.7 13.3 2 12.5 2H8V13H12.5C13.3 13 14 13.7 14 14V3.5Z"
                stroke="var(--ss-ink)"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="ss-dashboard__course-text">
            <span className="ss-dashboard__course-label">Currently learning</span>
            <span className="ss-dashboard__course-title">
              {course.title}
              {course.provider && <span className="ss-dashboard__course-provider"> · {course.provider}</span>}
            </span>
          </span>
        </Link>

        <div className="ss-trail">
          {trail.flatMap((stone, i) => {
            const items = [
              <span key={`s${i}`} className={`ss-trail__stone ss-trail__stone--${stone.state}`} />,
            ];
            if (i < trail.length - 1) {
              items.push(<span key={`g${i}`} className="ss-trail__gap" />);
            }
            return items;
          })}
        </div>

        <div className="ss-task-card">
          <div className="ss-task-card__eyebrow">Today's step</div>
          <h2 className="ss-task-card__title">{task.title}</h2>
          <p className="ss-task-card__meta">{task.meta}</p>

          <div
            className="ss-task-row"
            role="checkbox"
            aria-checked={done}
            tabIndex={0}
            onClick={() => setDone((v) => !v)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setDone((v) => !v)}
          >
            <span className={done ? "ss-checkmark ss-checkmark--checked" : "ss-checkmark"}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6L5 9L10 3"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="ss-task-row__label">{done ? "Completed" : "Mark as done"}</span>
          </div>
        </div>

        <div className="ss-stats-row">
          <div className="ss-stat">
            <div className="ss-stat__num">{progress}%</div>
            <div className="ss-stat__label">of this week's plan</div>
          </div>
          <div className="ss-stat ss-stat--right">
            <div className="ss-stat__num">{streak}</div>
            <div className="ss-stat__label">day streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
