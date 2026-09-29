import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../user-context";
import { findCourse, findTask } from "./course-utils";

export default function PlanUpdatedPreview() {
  const { scope, id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const courses = user?.courses || [];

  const course = scope === "course" ? findCourse(courses, id) : findTask(courses, id)?.course;
  const task = scope === "task" ? findTask(courses, id)?.task : null;
  const remaining = (course?.tasks || []).filter((t) => t.status !== "completed").length;

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
                <span>{course?.weeklyTime || "—"}</span>
              </div>
              <div className="ss-preview-summary__row">
                <span>Days</span>
                <span>{course?.days || "—"}</span>
              </div>
              <div className="ss-preview-summary__row">
                <span>Activities remaining</span>
                <span>{remaining}</span>
              </div>
            </>
          ) : (
            <div className="ss-preview-summary__row">
              <span>Now scheduled for</span>
              <span>{task?.scheduledDay || "—"}</span>
            </div>
          )}
        </div>

        <button type="button" className="ss-btn-primary" onClick={() => navigate("/plan")}>
          Continue
        </button>
      </div>
    </div>
  );
}
