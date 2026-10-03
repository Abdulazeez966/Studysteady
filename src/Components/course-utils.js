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

function reminderTimeToLabel(time) {
  if (!time) return "Evening";
  if (["Morning", "Afternoon", "Evening"].includes(time)) return time;
  const hour = Number(String(time).split(":")[0]);
  if (Number.isNaN(hour)) return "Evening";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function reminderDaysToMap(days) {
  if (days && !Array.isArray(days) && typeof days === "object") {
    return WEEKDAYS.reduce((result, day) => ({ ...result, [day]: Boolean(days[day]) }), {});
  }
  return WEEKDAYS.reduce((result, day) => ({ ...result, [day]: Array.isArray(days) && days.includes(day) }), {});
}

export function normalizeReminder(reminder) {
  if (!reminder) return null;
  return {
    enabled: Boolean(reminder.enabled),
    days: reminderDaysToMap(reminder.days),
    time: reminderTimeToLabel(reminder.time),
  };
}

export function effectiveReminders(course, task, accountDefault) {
  if (task?.reminderOverride !== null && task?.reminderOverride !== undefined) {
    return normalizeReminder(task.reminderOverride);
  }
  if (course?.reminderOverride !== null && course?.reminderOverride !== undefined) {
    return normalizeReminder(course.reminderOverride);
  }
  if (accountDefault?.enabled !== undefined) return normalizeReminder(accountDefault);
  if (accountDefault?.remindersEnabled !== undefined) {
    return {
      enabled: accountDefault.remindersEnabled,
      days: accountDefault.reminderDays || {},
      time: accountDefault.reminderTime || "Evening",
    };
  }
  return { enabled: false, days: {}, time: "Evening" };
}

export function reminderTimeToValue(time) {
  return { Morning: "08:00", Afternoon: "14:00", Evening: "18:00" }[time] || "18:00";
}

export function reminderMapToList(days) {
  return WEEKDAYS.filter((day) => days?.[day]);
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
