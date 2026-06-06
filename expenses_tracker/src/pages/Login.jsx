import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/API";
import LinkAccountModal from "../components/LinkAccountModal";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userinfo, setUserinfo] = useState({ email: "", pwd: "" });
  const [pendingLink, setPendingLink] = useState(null); // triggers modal when set
  const [oauthError, setOauthError] = useState("");

  const bg_style = {
    minHeight: "100vh",
    minWidth: "100vw",
    backgroundColor: "#f4f4f4",
    backgroundImage: `
      radial-gradient(circle at 50% 50%,
        #f4f4f4 0%, #ececec 40%, #d6d6d6 65%,
        rgba(60,60,60,0.14) 88%, rgba(30,30,30,0.22) 100%)
    `,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
  };

  // ── Read query params set by backend OAuth redirect ──────────────────────
  useEffect(() => {
    const error = searchParams.get("error");
    const hint = searchParams.get("hint");

    if (error === "account_exists" && hint === "link") {
      // Fetch the pending Google profile stored in the backend session
      API.get("/auth/google/pending-link", { withCredentials: true })
        .then((res) => setPendingLink(res.data))
        .catch(() =>
          setOauthError(
            "A local account with that email exists. Log in with your password instead.",
          ),
        );
    } else if (error === "oauth_failed") {
      setOauthError("Google sign-in failed. Please try again.");
    } else if (error === "server_error") {
      setOauthError("Something went wrong. Please try again.");
    }
  }, []);

  // ── Local login — completely unchanged from your original ─────────────────
  function handleChange(event) {
    const { name, value } = event.target;
    setUserinfo((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const { email, pwd } = userinfo;
    const normalizedEmail = email.toLowerCase();
    try {
      const response = await API.post("/users/login", {
        email: normalizedEmail,
        pwd,
      });
      const { user, token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/home");
      setUserinfo({ email: "", pwd: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  }

  // ── Google OAuth — just a redirect, backend does the work ─────────────────
  function handleGoogleLogin() {
    // Redirect browser to backend — passport takes over from here
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  }

  return (
    <div style={bg_style}>
      <div className="w-full max-w-md space-y-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-black/10 rounded-3xl shadow-2xl p-10 space-y-7 ring-1 ring-black/5 hover:scale-[1.01] transition-transform"
        >
          <h1 className="text-3xl text-center text-black tracking-tighter uppercase">
            Sign In
          </h1>

          {/* Error banner for OAuth failures */}
          {oauthError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
                color: "#dc2626",
              }}
            >
              {oauthError}
            </div>
          )}

          <input
            className="bg-black/5 border border-black/10 p-3 w-full rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white font-semibold text-lg transition"
            type="email"
            placeholder="Email"
            value={userinfo.email}
            name="email"
            onChange={handleChange}
            required
          />
          <input
            className="bg-black/5 border border-black/10 p-3 w-full rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white font-semibold text-lg transition"
            type="password"
            placeholder="Password"
            value={userinfo.pwd}
            name="pwd"
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg shadow-lg hover:bg-neutral-800 font-bold text-xl tracking-wide transition"
          >
            Log In
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#9ca3af",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            or
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          </div>

          {/* Google Sign In button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              background: "white",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#374151",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <GoogleIcon size={22} />
            Continue with Google
          </button>
        </form>

        <div className="bg-white border border-black/10 p-8 rounded-3xl shadow-xl flex flex-col items-center space-y-4">
          <h2 className="text-lg font-semibold text-center text-black tracking-wide">
            Don't have an account?
          </h2>
          <button
            className="w-full border-2 border-black py-3 rounded-lg text-black font-bold hover:bg-black hover:text-white transition-all"
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Link account modal — only shown for Case 3 */}
      {pendingLink && (
        <LinkAccountModal
          pendingLink={pendingLink}
          onSuccess={() => navigate("/home")}
          onClose={() => {
            setPendingLink(null);
            // Clean query params from URL without full reload
            navigate("/login", { replace: true });
          }}
        />
      )}
    </div>
  );
}

// Inline Google SVG — no package needed
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

export default Login;
