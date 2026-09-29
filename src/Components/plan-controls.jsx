import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import { isPaused } from "./course-utils";

export default function PlanControls() {
  const { user } = useUser();
  const courses = user?.courses || [];

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <Link to="/settings" className="ss-page-header__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Settings
        </Link>
        <div className="ss-page-header">
          <h1>Plan controls</h1>
          <p className="ss-page-header__sub">Pause or adjust any course, or go to a task to control it on its own.</p>
        </div>

        {courses.length === 0 ? (
          <p className="ss-empty-state">No courses yet.</p>
        ) : (
          <ul className="ss-course-list">
            {courses.map((course) => (
              <li key={course.id}>
                <Link to={`/plan/pause/course/${course.id}`} className="ss-course-row">
                  <div>
                    <div className="ss-course-row__title">{course.title}</div>
                    <div className="ss-course-row__provider">
                      {isPaused(course) ? `Paused until ${course.pauseReturnDate || "—"}` : "Active"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
