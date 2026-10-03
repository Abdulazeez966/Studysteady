import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "./api";

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function NotificationCenter() {
  const { user } = useUser();
  const token = user?.token;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    if (!token) return;
    try {
      const data = await getNotifications(token);
      setItems(Array.isArray(data?.notifications) ? data.notifications : []);
      setUnread(Number(data?.unread) || 0);
    } catch {
      // Notifications are non-blocking; the rest of the app should keep working.
    }
  }

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 30 * 1000);
    return () => window.clearInterval(interval);
  }, [token]);

  async function readOne(id) {
    try {
      await markNotificationRead(token, id);
      setItems((current) => current.map((item) => item._id === id ? { ...item, readAt: new Date().toISOString() } : item));
      setUnread((count) => Math.max(0, count - 1));
    } catch {}
  }

  async function readAll() {
    try {
      await markAllNotificationsRead(token);
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnread(0);
    } catch {}
  }

  if (!token) return null;

  return (
    <div className="ss-notification-center">
      <button
        type="button"
        className="ss-notification-bell"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 21h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {unread > 0 && <span className="ss-notification-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="ss-notification-panel">
          <div className="ss-notification-panel__header">
            <div>
              <strong>Notifications</strong>
              <span>{unread ? `${unread} unread` : "All caught up"}</span>
            </div>
            {unread > 0 && (
              <button type="button" className="ss-notification-panel__read-all" onClick={readAll}>Mark all read</button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="ss-notification-empty">Your task reminders will appear here.</p>
          ) : (
            <div className="ss-notification-list">
              {items.map((item) => (
                <div key={item._id} className={!item.readAt ? "ss-notification-item ss-notification-item--unread" : "ss-notification-item"}>
                  <button type="button" className="ss-notification-item__body" onClick={() => readOne(item._id)}>
                    <span className="ss-notification-item__title">{item.title}</span>
                    <span className="ss-notification-item__message">{item.message}</span>
                    <span className="ss-notification-item__meta">{item.reminderPeriod} · {formatTime(item.createdAt)}</span>
                  </button>
                  {item.event && (
                    <Link to={`/plan/${item.event}`} className="ss-notification-item__link" onClick={() => readOne(item._id)}>Open task</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
