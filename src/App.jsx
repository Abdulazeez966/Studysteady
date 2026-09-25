import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Welcome from "./Components/welcome";
import Login from "./Components/login";
import Signup from "./Components/signup";
import Onboarding from "./Components/onboarding";
import Layout from "./Components/layout";
import Dashboard from "./Components/dashboard";
import Plan from "./Components/plan";
import TaskView from "./Components/task-view";
import PlanPauseChoice from "./Components/plan-pause";
import PlanPauseDate from "./Components/plan-pause-date";
import PlanPauseConfirm from "./Components/plan-pause-confirm";
import PlanScheduleEditor from "./Components/plan-schedule-editor";
import PlanUpdatedPreview from "./Components/plan-updated-preview";
import Progress from "./Components/progress";
import Settings from "./Components/settings";
import Reminders from "./Components/reminders";
import Account from "./Components/account";
import PlanControls from "./Components/plan-controls";
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
      onSubmit={({ goal, why, programme, activities, weeklyTime, days, remindersEnabled, reminderDays, reminderTime }) => {
        const tasks = activities.map((title) => ({ id: taskId(), title, status: "pending" }));
        setUser((prev) => ({
          ...prev,
          goal, why, programme, weeklyTime, days, tasks,
          remindersEnabled, reminderDays, reminderTime,
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
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/plan" element={<Plan />} />
            <Route path="/plan/pause" element={<PlanPauseChoice />} />
            <Route path="/plan/pause/date" element={<PlanPauseDate />} />
            <Route path="/plan/pause/confirm" element={<PlanPauseConfirm />} />
            <Route path="/plan/pause/schedule" element={<PlanScheduleEditor />} />
            <Route path="/plan/pause/preview" element={<PlanUpdatedPreview />} />
            <Route path="/plan/:taskId" element={<TaskView />} />

            <Route path="/progress" element={<Progress />} />

            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/reminders" element={<Reminders />} />
            <Route path="/settings/account" element={<Account />} />
            <Route path="/settings/plan" element={<PlanControls />} />

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
