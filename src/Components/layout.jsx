import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./navbar";
import NotificationCenter from "./notification-center";
import { useUser } from "../user-context";
import { updatePresence } from "./api";

export default function Layout() {
  const { user } = useUser();
  const token = user?.token;

  useEffect(() => {
    if (!token) return undefined;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    let cancelled = false;

    const heartbeat = () => {
      if (!cancelled) updatePresence(token, timezone).catch(() => {});
    };

    heartbeat();
    const interval = window.setInterval(heartbeat, 2 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [token]);

  return (
    <div className="ss-app-shell">
      <NotificationCenter />
      <main className="ss-app-shell__content">
        <Outlet />
      </main>
      <NavBar />
    </div>
  );
}
