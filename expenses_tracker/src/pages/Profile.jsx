import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import NavSidebar from "../components/NavSidebar";
import API from "../services/API";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=1e293b&color=fff&size=128&name=";

function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [storedUser, setStoredUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")),
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editForm, setEditForm] = useState({
    uname: storedUser.uname || "",
    phone_no: storedUser.phone_no || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  const oldPassRef = useRef();
  const newPassRef = useRef();
  const confirmPassRef = useRef();
  const fileInputRef = useRef();

  const syncUser = (updatedFields) => {
    const updated = { ...storedUser, ...updatedFields };
    localStorage.setItem("currentUser", JSON.stringify(updated));
    setStoredUser(updated);
  };

  useEffect(() => {
    const linked = searchParams.get("linked");
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    if (linked === "true" && token) {
      localStorage.setItem("token", token);
      syncUser({ authProvider: "both" });
      setSearchParams({});
      alert("Google account linked successfully!");
    }
    if (error === "link_failed") {
      alert("Failed to link Google account. Please try again.");
      setSearchParams({});
    }
    if (error === "already_linked") {
      alert("This Google account is already linked to another user.");
      setSearchParams({});
    }
  }, []);

  const avatarSrc =
    previewUrl ||
    storedUser.profilePic ||
    `${DEFAULT_AVATAR}${encodeURIComponent(storedUser.uname)}`;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!editForm.uname.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    if (editForm.phone_no && !/^\d{10}$/.test(editForm.phone_no)) {
      alert("Phone number must be 10 digits.");
      return;
    }
    setEditLoading(true);
    try {
      let profilePic = storedUser.profilePic;
      if (selectedFile) {
        const base64 = await toBase64(selectedFile);
        const picRes = await API.patch("/users/update-profile-pic", {
          profilePic: base64,
        });
        profilePic = picRes.data.profilePic;
      }
      const res = await API.patch("/users/update-profile", {
        uname: editForm.uname,
        phone_no: editForm.phone_no,
      });
      syncUser({
        uname: res.data.user.uname,
        phone_no: res.data.user.phone_no,
        profilePic,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowEditModal(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating profile");
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const oldP = oldPassRef.current.value,
      newP = newPassRef.current.value,
      confirmP = confirmPassRef.current.value;
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

  const handleLinkGoogle = () => {
    const token = localStorage.getItem("token");
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/link?token=${token}`;
  };

  // ── Auth badge config ────────────────────────────────────────────────────
  const badgeConfig = {
    google: {
      label: "Google account",
      cls: "bg-blue-50 text-blue-600 border border-blue-200",
    },
    both: {
      label: "Local + Google linked",
      cls: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    },
    local: {
      label: "Local account",
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
    },
  };
  const badge = badgeConfig[storedUser.authProvider] || badgeConfig.local;

  return (
    <div className="flex min-h-screen w-full bg-slate-100">
      <div className="fixed top-0 left-0 h-screen">
        <NavSidebar />
      </div>

      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Profile</h2>

        {/* ── Profile card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          {/* Banner strip */}
          <div className="h-28 bg-gradient-to-r from-slate-800 to-slate-600 relative" />

          {/* Avatar — overlaps banner */}
          <div className="px-8 pb-6">
            <div className="flex items-end justify-between -mt-14 mb-5">
              <div className="relative group">
                <img
                  className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                  src={avatarSrc}
                  alt="Profile"
                  onError={(e) => {
                    e.target.src = `${DEFAULT_AVATAR}${encodeURIComponent(storedUser.uname)}`;
                  }}
                />
                {/* Camera overlay on hover */}
                <button
                  onClick={() => {
                    setEditForm({
                      uname: storedUser.uname,
                      phone_no: storedUser.phone_no || "",
                    });
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    setShowEditModal(true);
                  }}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Edit profile"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Action buttons top-right */}
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => {
                    setEditForm({
                      uname: storedUser.uname,
                      phone_no: storedUser.phone_no || "",
                    });
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                >
                  Edit Profile
                </button>

                {storedUser.authProvider !== "google" && (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                  >
                    Change Password
                  </button>
                )}

                {storedUser.authProvider === "local" && (
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <GoogleIcon size={16} />
                    Link Google
                  </button>
                )}
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-bold text-slate-900">
                {storedUser.uname}
              </h3>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.cls}`}
              >
                {badge.label}
              </span>
            </div>

            {/* Info rows */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
                label="Email"
                value={storedUser.email}
              />
              <InfoRow
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                }
                label="Phone"
                value={
                  storedUser.phone_no && !isNaN(storedUser.phone_no)
                    ? storedUser.phone_no
                    : "Not provided"
                }
                muted={!storedUser.phone_no || isNaN(storedUser.phone_no)}
              />
              <InfoRow
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
                label="Member since"
                value={new Date(storedUser.timestamp).toLocaleDateString(
                  "en-IN",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Danger Zone ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-50 rounded-lg mt-0.5">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-700 mb-1">
                Danger Zone
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Once you delete your account, all your data will be permanently
                removed. This cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* ── Edit Profile Modal ────────────────────────────────────────────── */}
        {showEditModal && (
          <Modal
            onClose={() => {
              setShowEditModal(false);
              setPreviewUrl(null);
              setSelectedFile(null);
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-5">
              Edit Profile
            </h3>

            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="relative group">
                <img
                  src={
                    previewUrl ||
                    storedUser.profilePic ||
                    `${DEFAULT_AVATAR}${encodeURIComponent(storedUser.uname)}`
                  }
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                  onError={(e) => {
                    e.target.src = `${DEFAULT_AVATAR}${encodeURIComponent(storedUser.uname)}`;
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
              <span className="text-xs text-slate-500">
                {selectedFile
                  ? selectedFile.name
                  : "Click photo to change · Max 2MB"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.uname}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, uname: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={editForm.phone_no}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, phone_no: e.target.value }))
                  }
                  placeholder="10-digit number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={editLoading}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </Modal>
        )}

        {/* ── Change Password Modal ─────────────────────────────────────────── */}
        {showPasswordModal && (
          <Modal onClose={() => setShowPasswordModal(false)}>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">
              Change Password
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { ref: oldPassRef, placeholder: "Current password" },
                { ref: newPassRef, placeholder: "New password" },
                { ref: confirmPassRef, placeholder: "Confirm new password" },
              ].map(({ ref, placeholder }) => (
                <input
                  key={placeholder}
                  ref={ref}
                  type="password"
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50"
                />
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                Update password
              </button>
            </div>
          </Modal>
        )}

        {/* ── Link Google Modal ─────────────────────────────────────────────── */}
        {showLinkModal && (
          <Modal onClose={() => setShowLinkModal(false)}>
            <div className="flex items-center gap-3 mb-3">
              <GoogleIcon size={24} />
              <h3 className="text-lg font-semibold text-gray-900">
                Link Google Account
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              You'll be redirected to Google to authorise the connection. Once
              linked, you can sign in with either your password or Google.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkGoogle}
                disabled={linkLoading}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <GoogleIcon size={15} />
                Continue with Google
              </button>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}

// ── Reusable modal wrapper ────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── Info row component ────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, muted = false }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
      <span className="text-slate-400 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p
          className={`text-sm font-medium truncate ${muted ? "text-slate-400 italic" : "text-slate-800"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Google icon ───────────────────────────────────────────────────────────────
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

// ── Base64 helper ─────────────────────────────────────────────────────────────
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default Profile;
