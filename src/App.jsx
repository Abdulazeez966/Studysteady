import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Landing from "./Components/landing";
import Login from "./Components/login";
import Signup from "./Components/signup";
import Onboarding from "./Components/onboarding";
import Layout from "./Components/layout";
import Dashboard from "./Components/dashboard";
import Plan from "./Components/plan";
import Progress from "./Components/progress";
import Settings from "./Components/settings";
import Reminders from "./Components/reminders";
import CatchupView from "./Components/catchup";
import { UserProvider, useUser } from "./user-context";
import "./App.css";

let taskIdCounter = 0;
function taskId() {
  taskIdCounter += 1;
  return `ob-task-${Date.now()}-${taskIdCounter}`;
}

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  return (
    <Login
      onSubmit={({ email }) => {
        // No backend yet — login can only guess a name from the email.
        setUser((prev) => ({ ...prev, name: email.split("@")[0], email }));
        navigate("/dashboard");
      }}
      onNavigateSignup={() => navigate("/signup")}
    />
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  return (
    <Signup
      onSubmit={({ fullName, email }) => {
        setUser((prev) => ({ ...prev, name: fullName, email }));
        navigate("/onboarding");
      }}
      onNavigateLogin={() => navigate("/login")}
    />
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  return (
    <Onboarding
      onSubmit={({ goal, why, programme, activities, weeklyTime, days, reminderDays, startNow }) => {
        const tasks = activities.map((title) => ({ id: taskId(), title, status: "pending" }));
        setUser((prev) => ({
          ...prev,
          goal,
          why,
          programme,
          weeklyTime,
          days,
          tasks,
          reminderDays,
          remindersEnabled: startNow,
        }));
        navigate("/dashboard");
      }}
    />
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/reminders" element={<Reminders />} />
            {/* Catch-up is contextual, not a nav tab — reached only from the
                Dashboard's catch-up state, per the architecture doc. */}
            <Route path="/catchup" element={<CatchupView />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
