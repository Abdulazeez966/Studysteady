import { useState } from "react";
import { uid, seedTasksForCourse } from "./course-utils";

export default function AddCourseForm({ onSave = () => {}, onCancel = null, submitLabel = "Add course" }) {
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [weeklyTime, setWeeklyTime] = useState("3 hours");
  const [days, setDays] = useState("Tue / Thu / Sat");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give this course a name.");
      return;
    }
    const course = {
      id: uid("course"),
      title: title.trim(),
      provider: provider.trim(),
      weeklyTime,
      days,
      paused: false,
      pauseReturnDate: null,
      reminderOverride: null,
      tasks: [],
    };
    course.tasks = seedTasksForCourse(course);
    onSave(course);
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className={error ? "ss-field ss-field--error" : "ss-field"}>
        <label htmlFor="course-title">Course name *</label>
        <input
          id="course-title"
          type="text"
          placeholder="e.g. Product Management"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(""); }}
        />
        {error && <div className="ss-field__error">{error}</div>}
      </div>
      <div className="ss-field">
        <label htmlFor="course-provider">Platform (optional)</label>
        <input
          id="course-provider"
          type="text"
          placeholder="e.g. Betechified, Udemy, Coursera"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
      </div>
      <div className="ss-field">
        <label htmlFor="course-time">Weekly time</label>
        <select id="course-time" value={weeklyTime} onChange={(e) => setWeeklyTime(e.target.value)}>
          <option>1 hour</option>
          <option>3 hours</option>
          <option>5 hours</option>
          <option>10+ hours</option>
        </select>
      </div>
      <div className="ss-field">
        <label htmlFor="course-days">Preferred days</label>
        <select id="course-days" value={days} onChange={(e) => setDays(e.target.value)}>
          <option>Tue / Thu / Sat</option>
          <option>Mon / Wed / Fri</option>
          <option>Weekends only</option>
          <option>Every day</option>
        </select>
      </div>
      <div className="ss-onboarding-nav">
        {onCancel && (
          <button type="button" className="ss-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="ss-btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
