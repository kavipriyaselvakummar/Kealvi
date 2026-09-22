"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser, UserSession } from "@/lib/auth";

const navItems = [
  { href: "/",           label: "Dashboard",   icon: "📊" },
  { href: "/summary",    label: "Summary",     icon: "📝" },
  { href: "/questions",  label: "Questions",   icon: "❓" },
  { href: "/polls",      label: "Polls",       icon: "🗳️" },
  { href: "/analytics",  label: "Analytics",   icon: "📈" },
  { href: "/leaderboard",label: "Leaderboard", icon: "🏆" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // Initial fetch
    setUser(getCurrentUser());

    // Listen to custom auth change events
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener("kealvi_auth_change", handleAuthChange);
    return () => {
      window.removeEventListener("kealvi_auth_change", handleAuthChange);
    };
  }, []);

  function handleSignOut() {
    logoutUser();
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "G";

  return (
    <aside style={{
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      position: "sticky",
      top: 0,
    }}>
      {/* Logo Header */}
      <div style={{
        padding: "22px 20px 18px",
        borderBottom: "1px solid var(--border)",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "-0.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-mid) 100%)",
              color: "#fff",
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
            }}>
              K
            </span>
            Kealvi
          </div>
          <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
            Live Q&amp;A &amp; Engagement
          </div>
        </Link>
      </div>

      {/* Nav Section Label */}
      <div style={{
        padding: "20px 20px 8px",
        fontSize: "10px",
        fontWeight: 600,
        color: "var(--muted)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}>
        Navigation
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                margin: "3px 0",
                fontSize: "13.5px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--accent)" : "var(--foreground)",
                background: isActive ? "var(--accent-light)" : "transparent",
                borderRadius: "8px",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: "15px" }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Profile Section (Displaying the user's name on the left side of the bottom) */}
      <div style={{
        padding: "16px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface2)",
      }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-mid) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                color: "#ffffff",
                flexShrink: 0,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}>
                {initial}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {user.name}
                </div>
                <div style={{
                  fontSize: "10.5px",
                  color: "var(--accent)",
                  fontWeight: 500,
                  display: "inline-block",
                  background: "var(--accent-light)",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  marginTop: "2px",
                }}>
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                fontSize: "16px",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--danger)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              🚪
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "8px" }}>
              Not signed in
            </div>
            <Link
              href="/login"
              style={{
                display: "block",
                width: "100%",
                padding: "8px 0",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#fff",
                background: "var(--accent)",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
            >
              🔑 Sign In / Register
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}