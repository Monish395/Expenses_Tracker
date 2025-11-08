import { useState, useRef } from "react";
import NavSidebar from "../components/NavSidebar";
import API from "../services/API";

function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const oldPassRef = useRef();
  const newPassRef = useRef();
  const confirmPassRef = useRef();

  // Change password
  const handleChangePassword = async () => {
    const oldP = oldPassRef.current.value;
    const newP = newPassRef.current.value;
    const confirmP = confirmPassRef.current.value;

    if (!oldP || !newP || !confirmP) return alert("Fill all fields");
    if (newP !== confirmP) return alert("Passwords do not match");

    try {
      const res = await API.patch("/users/change-password", {
        oldPassword: oldP,
        newPassword: newP,
      });
      alert(res.data.message);
      setShowPasswordModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error changing password");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    try {
      const res = await API.delete("/users/delete");
      alert(res.data.message);
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting account");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-100">
      <div className="fixed top-0 left-0 h-screen">
        <NavSidebar />
      </div>
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Profile</h2>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-4">
          <img
            className="w-32 h-32 rounded-full border-4 border-slate-950 object-cover"
            src="src/assets/profile_pic.jpeg"
            alt="Profile"
          />
          <div className="text-center">
            <p className="text-lg font-semibold">Name: {storedUser.uname}</p>
            <p className="text-gray-700">Email: {storedUser.email}</p>
            <p className="text-gray-700">
              Phone: {isNaN(storedUser.phone_no) ? "-" : storedUser.phone_no}
            </p>
          </div>
          <button
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <h3 className="text-xl font-semibold text-red-700">Danger Zone</h3>
          <p className="text-gray-600 mt-2">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            className="mt-4 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 transition"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-slate-600/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Change Password
              </h3>
              <form className="flex flex-col gap-3">
                <input
                  ref={oldPassRef}
                  type="password"
                  placeholder="Old Password"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  ref={newPassRef}
                  type="password"
                  placeholder="New Password"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  ref={confirmPassRef}
                  type="password"
                  placeholder="Confirm New Password"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;
