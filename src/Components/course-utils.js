
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAY_PATTERNS = {
  "Tue / Thu / Sat": ["Tuesday", "Thursday", "Saturday"],
  "Mon / Wed / Fri": ["Monday", "Wednesday", "Friday"],
  "Weekends only": ["Saturday", "Sunday"],
  "Every day": WEEKDAYS,
};

export function daysPatternToList(days) {
  return DAY_PATTERNS[days] || WEEKDAYS;
}

export function todayWeekday() {
  const jsDay = new Date().getDay();
  return WEEKDAYS[(jsDay + 6) % 7];
}

let idCounter = 0;
export function uid(prefix = "id") {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function seedTasksForCourse(course) {
  const dayList = daysPatternToList(course.days);
  const titles = [
    `Get started with ${course.title || "your course"}`,
    "Complete the first module",
    "Do the practice exercise",
  ];
  return titles.map((title, i) => ({
    id: uid("task"),
    title,
    status: "pending",
    scheduledDay: dayList[i % dayList.length],
    estimatedMinutes: 30,
  }));
}

export function getAllTasksFlat(courses) {
  return (courses || []).flatMap((course) =>
    (course.tasks || []).map((task) => ({ ...task, courseId: course.id, courseTitle: course.title }))
  );
}

export function findTask(courses, taskId) {
  for (const course of courses || []) {
    const task = (course.tasks || []).find((t) => t.id === taskId);
    if (task) return { task, course };
  }
  return null;
}

export function findCourse(courses, courseId) {
  return (courses || []).find((c) => c.id === courseId) || null;
}

function localISODate() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function pausedNow(entity) {
  if (!entity?.paused) return false;
  if (entity.pauseReturnDate && entity.pauseReturnDate <= localISODate()) return false;
  return true;
}

export function isPaused(course, task) {
  return pausedNow(course) || pausedNow(task);
}

export function getWaitingTasks(courses) {
  return (courses || []).flatMap((course) =>
    (course.tasks || [])
      .filter((t) => t.status !== "completed" && !isPaused(course, t))
      .map((t) => ({ ...t, courseId: course.id, courseTitle: course.title }))
  );
}

export function effectiveReminders(course, task, accountDefault) {
  if (task?.reminderOverride) return task.reminderOverride;
  if (course?.reminderOverride) return course.reminderOverride;
  if (accountDefault?.remindersEnabled !== undefined) {
    return {
      enabled: accountDefault.remindersEnabled,
      days: accountDefault.reminderDays || {},
      time: accountDefault.reminderTime || "Evening",
    };
  }
  return { enabled: false, days: {}, time: "Evening" };
}

export function courseStats(course) {
  const tasks = course.tasks || [];
  const completed = tasks.filter((t) => t.status === "completed").length;
  return { total: tasks.length, completed };
}

export function splitByTimeBudget(tasks, minutesAvailable) {
  if (!minutesAvailable || minutesAvailable <= 0) {
    return { fits: tasks, later: [] };
  }
  const fits = [];
  const later = [];
  let used = 0;
  for (const t of tasks) {
    const cost = t.estimatedMinutes || 30;
    if (used + cost <= minutesAvailable) {
      fits.push(t);
      used += cost;
    } else {
      later.push(t);
    }
  }
  return { fits, later };
}
