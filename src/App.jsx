import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Landing from "./Components/landing";
import Login from "./Components/login";
import Signup from "./Components/signup";
import Onboarding from "./Components/onboarding";
import Layout from "./Components/layout";
import Dashboard from "./Components/dashboard";
import Plan from "./Components/plan";
import Progress from "./Components/progress";
import Reminders from "./Components/reminders";
import { UserProvider, useUser } from "./user-context";
import "./App.css";

// Each auth/onboarding component takes plain callback props (onSubmit, etc.)
// so it stays testable on its own — these small wrappers are where routing
// and the frontend-only user store actually get connected.

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  return (
    <Login
      onSubmit={({ email }) => {
        // No backend yet — we don't actually know the user's name or
        // history at login, so we can only guess a name from the email.
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
      onSubmit={({ goal, weeklyTime, days }) => {
        setUser((prev) => ({ ...prev, goal, weeklyTime, days }));
        navigate("/dashboard");
      }}
    />
  );
}

function DashboardPage() {
  const { user } = useUser();

  const firstName = user?.name ? user.name.split(" ")[0] : undefined;

  // Real date, read straight from the browser — genuinely personalized,
  // no backend needed, and it's always accurate for "today."
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hasOnboardingData = Boolean(user?.goal);

  const course = hasOnboardingData ? { title: user.goal } : undefined;

  const task = hasOnboardingData
    ? {
        title: `Continue: ${user.goal}`,
        meta: [user.weeklyTime && `${user.weeklyTime} this week`, user.days]
          .filter(Boolean)
          .join(" · "),
      }
    : undefined;

  // A brand-new user hasn't completed anything yet — show that honestly
  // instead of a fake head start.
  const freshTrail = hasOnboardingData
    ? [
        { state: "today" },
        { state: "upcoming" },
        { state: "upcoming" },
        { state: "upcoming" },
        { state: "upcoming" },
      ]
    : undefined;

  return (
    <Dashboard
      userName={firstName}
      weekLabel={todayLabel}
      course={course}
      task={task}
      trail={freshTrail}
      progressBase={hasOnboardingData ? 0 : undefined}
      progressAfterComplete={hasOnboardingData ? 20 : undefined}
      streakBase={hasOnboardingData ? 0 : undefined}
      streakAfterComplete={hasOnboardingData ? 1 : undefined}
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/reminders" element={<Reminders />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
