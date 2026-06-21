import { useState, useEffect } from "react";
import API from "../services/API";

// pendingLink shape: { googleId, profilePic, email }
function LinkAccountModal({ pendingLink, onSuccess, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLink() {
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/google/link-by-password", {
        email: pendingLink.email,
        password,
        pendingToken: pendingLink.pendingToken,
        profilePic: pendingLink.profilePic,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      onSuccess(); // parent will navigate to /home
    } catch (err) {
      setError(err.response?.data?.message || "Linking failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
        padding: "1rem",
      }}
    >
      {/* Modal card — stop click from bubbling to backdrop */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "1.5rem",
          padding: "1.75rem",
          width: "100%",
          maxWidth: "420px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Google icon + heading */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <GoogleIcon size={28} />
          <h2
            style={{
              margin: 0,
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#111",
            }}
          >
            Link your Google account
          </h2>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "0.92rem",
            color: "#555",
            lineHeight: 1.6,
          }}
        >
          An account with <strong>{pendingLink.email}</strong> already exists.
          Enter your password to link Google to it — you'll be able to use
          either method going forward.
        </p>

        <input
          type="password"
          placeholder="Your existing password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLink()}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            outline: "none",
            backgroundColor: "#f9fafb",
            color: "#111",
          }}
        />

        {error && (
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#dc2626" }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "1.5px solid #d1d5db",
              borderRadius: "0.5rem",
              background: "white",
              color: "#374151",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleLink}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "none",
              borderRadius: "0.5rem",
              background: loading ? "#9ca3af" : "#111",
              color: "white",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.95rem",
            }}
          >
            {loading ? "Linking..." : "Link & Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline SVG Google icon — no extra package needed
function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.08-6.08C34.46 3.19 29.5 1 24 1 14.82 1 7.07 6.48 3.58 14.18l7.08 5.5C12.43 13.22 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.97-2.2 5.48-4.67 7.17l7.17 5.57C43.33 37.36 46.5 31.36 46.5 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.66 28.32A14.6 14.6 0 0 1 9.5 24c0-1.5.26-2.95.72-4.32l-7.08-5.5A23.94 23.94 0 0 0 0 24c0 3.87.93 7.53 2.58 10.76l8.08-6.44z"
      />
      <path
        fill="#34A853"
        d="M24 47c5.5 0 10.12-1.82 13.5-4.96l-7.17-5.57C28.5 37.96 26.36 38.5 24 38.5c-6.26 0-11.57-3.72-13.34-9.18l-8.08 6.44C6.07 43.52 14.45 47 24 47z"
      />
    </svg>
  );
}

export default LinkAccountModal;
