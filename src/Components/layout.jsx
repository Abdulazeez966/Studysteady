import { Outlet } from "react-router-dom";
import NavBar from "./navbar";
import "../App.css";

export default function Layout() {
  return (
    <div className="ss-app-shell">
      <NavBar />
      <main className="ss-app-shell__content">
        <Outlet />
      </main>
    </div>
  );
}
