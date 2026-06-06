import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/API";

function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      // No token means something went wrong on the backend
      navigate("/login?error=oauth_failed");
      return;
    }

    // Store token first so the API call below is authenticated
    localStorage.setItem("token", token);

    // Fetch full user profile using the token
    API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        navigate("/home");
      })
      .catch(() => {
        // Token was invalid or request failed
        localStorage.removeItem("token");
        navigate("/login?error=oauth_failed");
      });
  }, []);

  // Minimal loading state — user sees this for <1 second
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
        backgroundColor: "#f4f4f4",
      }}
    >
      <p style={{ color: "#555", fontSize: "1.1rem" }}>Signing you in...</p>
    </div>
  );
}

export default OAuthSuccess;
