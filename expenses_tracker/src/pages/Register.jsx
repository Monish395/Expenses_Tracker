import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  // Darker sophisticated background with subtle gradient
  // const bg_style = {
  //   minHeight: "100vh",
  //   minWidth: "100vw",
  //   backgroundColor: "#2a2a2a",
  //   backgroundImage: `
  //     radial-gradient(circle at 20% 30%, rgba(60, 60, 60, 0.4) 0%, transparent 50%),
  //     radial-gradient(circle at 80% 70%, rgba(70, 70, 70, 0.3) 0%, transparent 50%),
  //     repeating-linear-gradient(135deg, #2a2a2a 0px, #2a2a2a 2px, #333333 2px, #333333 14px)
  //   `,
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
  // };

  const bg_style = {
    minHeight: "100vh",
    minWidth: "100vw",
    backgroundColor: "#f4f4f4",
    backgroundImage: `
    radial-gradient(circle at 50% 50%,
      #f4f4f4 0%,
      #ececec 55%,
      #d6d6d6 75%,
      rgba(60,60,60,0.14) 88%,
      rgba(30,30,30,0.22) 100%)
  `,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
  };

  const [userinfo, setUserinfo] = useState({
    email: "",
    pwd: "",
    uname: "",
    phone_no: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setUserinfo((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const { email, pwd, uname, phone_no } = userinfo;
    // Validation stays as in your code
    if (!uname.trim() || !email.trim() || !pwd.trim()) {
      alert("All fields except phone number are required!");
      return;
    }
    if (pwd.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }
    if (phone_no && !/^\d{10}$/.test(phone_no)) {
      alert("Phone number must contain only digits (10 digits).");
      return;
    }
    try {
      await axios.post("http://localhost:5000/users/register", {
        email,
        pwd,
        uname,
        phone_no,
      });
      setUserinfo({ email: "", pwd: "", uname: "", phone_no: "" });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div style={bg_style}>
      <div className="flex items-center justify-center min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-2xl shadow-xl w-[430px] space-y-7 border border-zinc-200"
        >
          <h1 className="text-2xl font-bold text-center text-black mb-3 tracking-tight uppercase">
            Welcome to Expenses Tracker
          </h1>

          <input
            className="border border-zinc-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-black focus:bg-white bg-zinc-100 transition text-black placeholder-gray-500 text-[1.08rem]"
            type="text"
            placeholder="Name"
            value={userinfo.uname}
            name="uname"
            onChange={handleChange}
            required
          />
          <input
            className="border border-zinc-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-black focus:bg-white bg-zinc-100 transition text-black placeholder-gray-500 text-[1.08rem]"
            type="email"
            placeholder="Email"
            value={userinfo.email}
            name="email"
            onChange={handleChange}
            required
          />
          <input
            className="border border-zinc-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-black focus:bg-white bg-zinc-100 transition text-black placeholder-gray-500 text-[1.08rem]"
            type="password"
            placeholder="New Password"
            value={userinfo.pwd}
            name="pwd"
            onChange={handleChange}
            required
          />
          <input
            className="border border-zinc-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-black focus:bg-white bg-zinc-100 transition text-black placeholder-gray-500 text-[1.08rem]"
            type="tel"
            placeholder="Phone Number (optional)"
            value={userinfo.phone_no}
            name="phone_no"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded shadow-lg font-bold tracking-wide text-[1.08rem] hover:bg-neutral-800 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
