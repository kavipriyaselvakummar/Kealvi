import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Kealvi — Live Q&A, Polls & Analytics",
  description: "Live Q&A, Polls, AI Analytics and Audience Engagement Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}>
          <Sidebar />
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Topbar */}
            <div style={{
              padding: "16px 32px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--muted)" }}>
                🗓️ {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                  fontSize: "11.5px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }}></span>
                  Live Session Active
                </span>
              </div>
            </div>
            {/* Page content */}
            <main style={{ padding: "32px", flex: 1, minWidth: 0 }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}