import { createContext, useContext, useRef, useState } from "react";

const UserContext = createContext(null);
const STORAGE_KEY = "studysteady_user";
const SESSION_FIELDS = ["id", "name", "email", "token"];

function readSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return null;
    const session = SESSION_FIELDS.reduce((result, field) => {
      if (parsed[field] !== undefined) result[field] = parsed[field];
      return result;
    }, {});
    return Object.keys(session).length ? session : null;
  } catch {
    return null;
  }
}

function persistSession(user) {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const session = SESSION_FIELDS.reduce((stored, field) => {
      if (user[field] !== undefined) stored[field] = user[field];
      return stored;
    }, {});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
  }
}

export function UserProvider({ children }) {
  const [userState, setUserState] = useState(readSession);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userRef = useRef(userState);

  function setUser(nextUser) {
    const next = typeof nextUser === "function" ? nextUser(userRef.current) : nextUser;

    if (next === null) {
      userRef.current = null;
      setUserState(null);
      persistSession(null);
      setLoading(false);
      setError("");
      window.location.assign("/");
      return;
    }

    userRef.current = next;
    setUserState(next);
    persistSession(next);
  }

  return (
    <UserContext.Provider value={{ user: userState, setUser, isLoading, setLoading, error, setError }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside a UserProvider");
  }
  return ctx;
}
