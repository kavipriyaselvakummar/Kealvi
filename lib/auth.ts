export type UserSession = {
  id: string;
  email: string;
  name: string;
  role: string;
};

const AUTH_KEY = "kealvi_user_session";

export function getCurrentUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data) as UserSession;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserSession | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(AUTH_KEY);
  } else {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
  // Dispatch a custom event so UI components like Sidebar update immediately
  window.dispatchEvent(new Event("kealvi_auth_change"));
}

export function logoutUser(): void {
  setCurrentUser(null);
}
