"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/",           label: "Dashboard",   icon: "ti-layout-dashboard" },
  { href: "/summary",    label: "Summary",     icon: "ti-chart-bar" },
  { href: "/questions",  label: "Questions",   icon: "ti-help-circle" },
  { href: "/polls",      label: "Polls",       icon: "ti-ballpen" },
  { href: "/analytics",  label: "Analytics",   icon: "ti-trending-up" },
  { href: "/leaderboard",label: "Leaderboard", icon: "ti-trophy" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      background: "var(--surface)",
      borderRight: "0.5px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      position: "sticky",
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "0.5px solid var(--border)",
      }}>
        <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--accent)", letterSpacing: "-0.5px" }}>
          Kealvi
        </div>
        <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
          Live Q&A &amp; Polls
        </div>
      </div>

      {/* Nav label */}
      <div style={{
        padding: "16px 12px 8px",
        fontSize: "10px",
        fontWeight: 500,
        color: "var(--muted)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}>
        Navigate
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 16px",
                fontSize: "13px",
                color: isActive ? "var(--accent)" : "var(--muted)",
                background: isActive ? "var(--accent-light)" : "transparent",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: "16px" }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div style={{
        padding: "16px",
        borderTop: "0.5px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "var(--accent-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--accent)",
          flexShrink: 0,
        }}>
          N
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>You</div>
          <div style={{ fontSize: "11px", color: "var(--muted)" }}>Attendee</div>
        </div>
      </div>
    </aside>
  );
}