import { Link } from "react-router-dom";
import { useUser } from "../user-context";
import "../App.css";

function Chevron() {
  return (
    <svg className="ss-settings-row__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Settings() {
  const { user } = useUser();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="ss-page">
      <div className="ss-page__inner">
        <div className="ss-page-header">
          <h1>Settings</h1>
        </div>

        <div className="ss-card ss-page__section">
          <ul className="ss-settings-list">
            <li>
              <Link to="/settings/account" className="ss-settings-row">
                <div className="ss-account-card" style={{ marginBottom: 0 }}>
                  <div className="ss-account-avatar">{initial}</div>
                  <div>
                    <div className="ss-account-name">{user?.name || "Your account"}</div>
                    <div className="ss-account-email">{user?.email || "—"}</div>
                  </div>
                </div>
                <Chevron />
              </Link>
            </li>
          </ul>
        </div>

        <div className="ss-card">
          <ul className="ss-settings-list">
            <li>
              <Link to="/settings/reminders" className="ss-settings-row">
                <div>
                  <div className="ss-settings-row__title">Reminder Settings</div>
                  <div className="ss-settings-row__sub">Days, time of day, on/off</div>
                </div>
                <Chevron />
              </Link>
            </li>
            <li>
              <Link to="/settings/plan" className="ss-settings-row">
                <div>
                  <div className="ss-settings-row__title">Plan controls</div>
                  <div className="ss-settings-row__sub">Pause, adjust pace or schedule</div>
                </div>
                <Chevron />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
