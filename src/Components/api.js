const BASE_URL = (import.meta.env.VITE_API_URL || "https://study-steady-backend.onrender.com/api").replace(/\/+$/, "");

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return json?.data;
}

export function registerUser({ name, email, password }) {
  return request("/auth/register", { method: "POST", body: { name, email, password } });
}

export function loginUser({ email, password }) {
  return request("/auth/login", { method: "POST", body: { email, password } });
}

export function deleteAccount(token, password) {
  return request("/auth/account", { method: "DELETE", body: { password }, token });
}

export function createGoal(token, { subject, description, provider, targetDate }) {
  return request("/goals", { method: "POST", body: { subject, description, provider, targetDate }, token });
}

export function getGoals(token) {
  return request("/goals", { token });
}

export function getGoal(token, goalId) {
  return request(`/goals/${goalId}`, { token });
}

export function updateGoal(token, goalId, patch) {
  return request(`/goals/${goalId}`, { method: "PUT", body: patch, token });
}

export function deleteGoal(token, goalId) {
  return request(`/goals/${goalId}`, { method: "DELETE", token });
}

export function createPlan(token, { goal, activities, weeklyTime, daysOfWeek, startDate, endDate }) {
  return request("/plans", { method: "POST", body: { goal, activities, weeklyTime, daysOfWeek, startDate, endDate }, token });
}

export function createCourse(token, { title, description = "", provider = "", targetDate = null, weeklyTime, days, activities, endDate = null }) {
  return request("/courses", {
    method: "POST",
    body: {
      title,
      description,
      provider,
      targetDate,
      activities,
      weeklyTime,
      daysOfWeek: days,
      startDate: new Date().toISOString(),
      endDate,
    },
    token,
  });
}

export function getPlans(token) {
  return request("/plans", { token });
}

export function getPlan(token, planId) {
  return request(`/plans/${planId}`, { token });
}

export function updatePlan(token, planId, patch) {
  return request(`/plans/${planId}`, { method: "PUT", body: patch, token });
}

export function pausePlan(token, planId, returnDate) {
  return request(`/plans/${planId}/pause`, { method: "PUT", body: { returnDate }, token });
}

export function resumePlan(token, planId) {
  return request(`/plans/${planId}/resume`, { method: "PUT", token });
}

export function adjustPlanSchedule(token, planId, { daysOfWeek, activities, weeklyTime, endDate }) {
  return request(`/plans/${planId}/adjust`, { method: "PUT", body: { daysOfWeek, activities, weeklyTime, endDate }, token });
}

export function updatePlanReminders(token, planId, override) {
  const body = override === null ? { clear: true } : override;
  return request(`/plans/${planId}/reminders`, { method: "PUT", body, token });
}

export function deletePlan(token, planId) {
  return request(`/plans/${planId}`, { method: "DELETE", token });
}

export function getEvents(token, { date, planId, goalId } = {}) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (planId) params.set("planId", planId);
  if (goalId) params.set("goalId", goalId);
  const qs = params.toString();
  return request(`/events${qs ? `?${qs}` : ""}`, { token });
}

export function getEvent(token, eventId) {
  return request(`/events/${eventId}`, { token });
}

export function updateEvent(token, eventId, { scheduledDate, scheduledTime, estimatedMinutes, title }) {
  return request(`/events/${eventId}`, {
    method: "PUT",
    body: { scheduledDate, scheduledTime, estimatedMinutes, title },
    token,
  });
}

export function pauseEvent(token, eventId, returnDate) {
  return request(`/events/${eventId}/pause`, { method: "PUT", body: { returnDate }, token });
}

export function resumeEvent(token, eventId) {
  return request(`/events/${eventId}/resume`, { method: "PUT", token });
}

export function updateEventReminders(token, eventId, override) {
  const body = override === null ? { clear: true } : override;
  return request(`/events/${eventId}/reminders`, { method: "PUT", body, token });
}

export function startActivity(token, eventId) {
  return request("/activities/start", { method: "POST", body: { eventId }, token });
}

export function completeActivity(token, activityId) {
  return request(`/activities/${activityId}/complete`, { method: "PUT", token });
}

export function snoozeActivity(token, activityId) {
  return request(`/activities/${activityId}/snooze`, { method: "PUT", token });
}

export function getActivities(token, { status, planId } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (planId) params.set("planId", planId);
  const qs = params.toString();
  return request(`/activities${qs ? `?${qs}` : ""}`, { token });
}

export function getProgress(token, planId) {
  const qs = planId ? `?planId=${planId}` : "";
  return request(`/progress${qs}`, { token });
}

export function getMissedSummary(token) {
  return request("/progress/missed-summary", { token });
}

export function getAccountReminders(token) {
  return request("/reminders", { token });
}

export function updateAccountReminders(token, { enabled, days, time }) {
  return request("/reminders", { method: "PUT", body: { enabled, days, time }, token });
}

export function getRecoveryTask(token) {
  return request("/recovery/task", { token });
}

export function snoozeRecovery(token, activityId) {
  return request(`/recovery/${activityId}/snooze`, { method: "PUT", token });
}

export function recoverActivity(token, activityId) {
  return request(`/recovery/${activityId}/recover`, { method: "PUT", token });
}


export function updatePresence(token, timezone) {
  return request("/auth/presence", { method: "POST", body: { timezone }, token });
}

export function getNotifications(token) {
  return request("/notifications", { token });
}

export function markNotificationRead(token, notificationId) {
  return request(`/notifications/${notificationId}/read`, { method: "PUT", token });
}

export function markAllNotificationsRead(token) {
  return request("/notifications/read-all", { method: "PUT", token });
}
