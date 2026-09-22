"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Attendee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const payload = isSignUp ? { name, email, password, role } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        return;
      }

      if (data.user) {
        setCurrentUser(data.user);
        setSuccessMsg(isSignUp ? "Account created successfully!" : "Welcome back!");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 600);
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin(demoEmail: string, demoName: string, demoRole: string) {
    const demoUser = {
      id: "demo-" + Date.now(),
      email: demoEmail,
      name: demoName,
      role: demoRole,
    };
    setCurrentUser(demoUser);
    setSuccessMsg(`Signed in as ${demoName}`);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 400);
  }

  return (
    <div style={{
      maxWidth: "460px",
      margin: "40px auto",
      padding: "32px",
      background: "var(--surface)",
      borderRadius: "16px",
      border: "1px solid var(--border)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-mid) 100%)",
          color: "#fff",
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "12px",
        }}>
          K
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--foreground)", margin: "0 0 6px" }}>
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
          {isSignUp
            ? "Join Kealvi to participate in live Q&A sessions and polls"
            : "Sign in to manage your questions, votes, and polls"}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        background: "var(--surface2)",
        borderRadius: "8px",
        padding: "4px",
        marginBottom: "24px",
      }}>
        <button
          type="button"
          onClick={() => { setIsSignUp(false); setError(null); }}
          style={{
            flex: 1,
            padding: "9px 0",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: !isSignUp ? "var(--surface)" : "transparent",
            color: !isSignUp ? "var(--accent)" : "var(--muted)",
            boxShadow: !isSignUp ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s",
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsSignUp(true); setError(null); }}
          style={{
            flex: 1,
            padding: "9px 0",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: isSignUp ? "var(--surface)" : "transparent",
            color: isSignUp ? "var(--accent)" : "var(--muted)",
            boxShadow: isSignUp ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s",
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Error / Success feedback */}
      {error && (
        <div style={{
          padding: "12px 14px",
          borderRadius: "8px",
          background: "#fee2e2",
          border: "1px solid #fca5a5",
          color: "#b91c1c",
          fontSize: "13px",
          marginBottom: "20px",
        }}>
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: "12px 14px",
          borderRadius: "8px",
          background: "#dcfce7",
          border: "1px solid #86efac",
          color: "#15803d",
          fontSize: "13px",
          marginBottom: "20px",
        }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {isSignUp && (
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--foreground)", marginBottom: "6px" }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Priya Selvakumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="kv-input"
              required={isSignUp}
            />
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--foreground)", marginBottom: "6px" }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="kv-input"
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--foreground)", marginBottom: "6px" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="kv-input"
            required
          />
        </div>

        {isSignUp && (
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--foreground)", marginBottom: "6px" }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="kv-input"
              style={{ cursor: "pointer" }}
            >
              <option value="Attendee">Attendee</option>
              <option value="Speaker">Speaker / Host</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "14px",
            marginTop: "8px",
            borderRadius: "8px",
          }}
        >
          {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </form>

      {/* Demo Quick Logins */}
      <div style={{
        marginTop: "28px",
        paddingTop: "20px",
        borderTop: "1px solid var(--border)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
          Quick Demo Accounts
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => handleDemoLogin("priya@kealvi.com", "Priya Selvakumar", "Speaker")}
            style={{
              flex: 1,
              padding: "8px 10px",
              fontSize: "12px",
              background: "var(--accent-light)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            👤 Priya (Speaker)
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin("alex@kealvi.com", "Alex Chen", "Attendee")}
            style={{
              flex: 1,
              padding: "8px 10px",
              fontSize: "12px",
              background: "var(--surface2)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            👤 Alex (Attendee)
          </button>
        </div>
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Link href="/" style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
