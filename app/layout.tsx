import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Kealvi",
  description: "Live Q&A, Polls and Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "100vh" }}>
          <Sidebar />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Topbar */}
            <div style={{
              padding: "14px 28px",
              borderBottom: "0.5px solid var(--border)",
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
              </span>
              <span style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "20px",
                fontWeight: 500,
              }}>
                Live Q&amp;A &amp; Polls
              </span>
            </div>
            {/* Page content */}
            <main style={{ padding: "28px", flex: 1 }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}