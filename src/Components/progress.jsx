import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import { getAllTasksFlat } from "./course-utils";
import ProgressRing from "./progress-ring";

const STATUS_LABELS = { pending: "Pending", in_progress: "In progress", completed: "Completed" };

export default function Progress() {
  const { user } = useUser();
  const courses = user?.courses || [];
  const allTasks = getAllTasksFlat(courses);
  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === "completed").length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <h1>My Progress</h1>
        </div>

        {total === 0 ? (
          <div className="ss-card">
            <p className="ss-empty-state">
              You haven't added any courses yet. <Link to="/plan">Set up your plan</Link> to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="ss-card ss-page__section ss-card--center">
              <div className="ss-progress-ring-wrap">
                <ProgressRing value={completed} max={total} size={128} strokeWidth={12} />
              </div>
              <h2 className="ss-progress-percent-heading">{percent}% complete</h2>
              <p className="ss-progress-goal-label">Across {courses.length} course{courses.length === 1 ? "" : "s"}</p>

              <div className="ss-progress-stats">
                <div className="ss-progress-stat ss-progress-stat--done">
                  <div className="ss-progress-stat__num">{completed}</div>
                  <div className="ss-progress-stat__label">Done</div>
                </div>
                <div className="ss-progress-stat">
                  <div className="ss-progress-stat__num">{total - completed}</div>
                  <div className="ss-progress-stat__label">Left</div>
                </div>
              </div>
            </div>

            {courses.map((course) => {
              const tasks = course.tasks || [];
              const cCompleted = tasks.filter((t) => t.status === "completed").length;
              const completedTasks = tasks.filter((t) => t.status === "completed");
              return (
                <div key={course.id} className="ss-card ss-course-section">
                  <div className="ss-course-section__header">
                    <h2 className="ss-plan-title">{course.title}</h2>
                    <span className="ss-badge">{cCompleted}/{tasks.length}</span>
                  </div>
                  <div className="ss-progress-ring-wrap">
                    <ProgressRing value={cCompleted} max={tasks.length || 1} size={68} strokeWidth={7} />
                  </div>
                  {completedTasks.length > 0 && (
                    <ul className="ss-completed-list">
                      {completedTasks.map((t) => (
                        <li key={t.id} className="ss-list-row">
                          <span className="ss-completed-list__check">
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="#1B685E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          {t.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
