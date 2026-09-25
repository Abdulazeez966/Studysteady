import { Outlet } from "react-router-dom";
import NavBar from "./navbar";
import "../App.css";

export default function Layout() {
  return (
    <div className="ss-app-shell">
      <main className="ss-app-shell__content">
        <Outlet />
      </main>
      <NavBar />
    </div>
  );
}
