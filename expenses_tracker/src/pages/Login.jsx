import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const bg_style = {
    minHeight: "100vh",
    minWidth: "100vw",
    backgroundColor: "#f4f4f4",
    backgroundImage: `
    radial-gradient(circle at 50% 50%,
      #f4f4f4 0%,
      #ececec 40%,
      #d6d6d6 65%,
      rgba(60,60,60,0.14) 88%,
      rgba(30,30,30,0.22) 100%)
  `,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
  };

  const [userinfo, setUserinfo] = useState({ email: "", pwd: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setUserinfo((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const { email, pwd } = userinfo;
    const normalizedEmail = email.toLowerCase();
    try {
      const response = await axios.post("http://localhost:5000/users/login", {
        email: normalizedEmail,
        pwd,
      });
      const { user, token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      // alert("Login successful!");
      navigate("/home");
      setUserinfo({ email: "", pwd: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  }

  function registerUser() {
    navigate("/Register");
  }

  return (
    <div style={bg_style}>
      <div className="w-full max-w-md space-y-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-black/10 rounded-3xl shadow-2xl p-10 space-y-7 ring-1 ring-black/5 hover:scale-[1.01] transition-transform"
        >
          <h1 className="text-3xl  text-center text-black tracking-tighter uppercase">
            Sign In
          </h1>
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
        </form>
        <div className="bg-white border border-black/10 p-8 rounded-3xl shadow-xl flex flex-col items-center space-y-4">
          <h2 className="text-lg font-semibold text-center text-black tracking-wide">
            Don't have an account?
          </h2>
          <button
            className="w-full border-2 border-black py-3 rounded-lg text-black font-bold hover:bg-black hover:text-white transition-all"
            onClick={registerUser}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
