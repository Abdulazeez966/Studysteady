import { createContext, useContext, useEffect, useState } from "react";

// Frontend-only "who's using the app right now" store.
// No verification, no server round-trip — just remembers what was typed
// at signup/login so the rest of the UI can greet the user by name.
// Swap this out for real auth state later; nothing downstream should change.

const UserContext = createContext(null);
const STORAGE_KEY = "studysteady_user";

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — fail silently,
      // user just won't persist across refreshes.
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
