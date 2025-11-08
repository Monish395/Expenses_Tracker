import { useState, useEffect } from "react";
import NavSidebar from "../../components/NavSidebar";
import API from "../../services/api";

// helper to generate group code
// const generateGroupCode = () => {
//   return "GRP" + Math.random().toString(36).substring(2, 8).toUpperCase();
// };

function CreateGroup() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  // const users = JSON.parse(localStorage.getItem("users")) || [];
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);
  //We get the groups just to update them, the whole thing is taken care in backend
  // const [groups, setGroups] = useState(
  //   JSON.parse(localStorage.getItem("groups")) || []
  // );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "/placeholder.png", // for now placeholder
    members: [],
  });

  const [memberName, setMemberName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  // Add member by username
  const handleAddMember = () => {
    if (!memberName) return;

    // Check if user exists in registered users
    const existingUser = users.find((u) => u.uname === memberName);
    if (!existingUser) {
      setErrorMsg("User does not exist!");
      return;
    }

    // Check for duplicate
    if (formData.members.some((m) => m.username === memberName)) {
      setErrorMsg("User already added!");
      return;
    }

    if (user.uname === memberName) {
      setErrorMsg("Admin is added by default!");
      return;
    }

    // Add to group members
    setFormData({
      ...formData,
      members: [...formData.members, { username: memberName, role: "member" }],
    });
    setMemberName("");
    setErrorMsg("");
  };

  // Save group to localStorage
  // const handleCreateGroup = () => {
  //   if (!formData.name) {
  //     alert("Group name is required!");
  //     return;
  //   }
  //   const newGroup = {
  //     id: Date.now().toString(),
  //     name: formData.name,
  //     description: formData.description,
  //     icon: formData.icon,
  //     code: generateGroupCode(),
  //     createdBy: user.uname, // 👈 NEW: track group creator
  //     members: [
  //       { username: user.uname, role: "admin" }, // creator as admin
  //       ...formData.members, // already in { username, role }
  //     ],
  //   };

  //   const updatedGroups = [...groups, newGroup];
  //   setGroups(updatedGroups);
  //   localStorage.setItem("groups", JSON.stringify(updatedGroups));

  //   setFormData({
  //     name: "",
  //     description: "",
  //     icon: "/placeholder.png",
  //     members: [],
  //   });
  //   setSuccessMsg(
  //     `Group created! Share this code with others: ${newGroup.code}`
  //   );
  // };
  const handleCreateGroup = async () => {
    if (!formData.name) {
      alert("Group name is required!");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        members: formData.members, // only extra members, admin added in backend
      };

      const res = await API.post("/groups", payload);

      setSuccessMsg(
        `Group created! Share this code with others: ${res.data.code}`
      );
      setFormData({
        name: "",
        description: "",
        icon: "/placeholder.png",
        members: [],
      });
    } catch (err) {
      alert(err.response?.data?.message || "Could not create group");
    }
  };

  // Handle join group logic
  // const handleJoinGroup = () => {
  //   const groupIndex = groups.findIndex((g) => g.code === joinCode.trim());
  //   if (groupIndex === -1) {
  //     setJoinError("Group not found. Please check the code.");
  //     return;
  //   }

  //   const group = groups[groupIndex];
  //   // prevent duplicate join
  //   if (group.members.some((m) => m.username === user.uname)) {
  //     setJoinError("You are already a member of this group.");
  //     return;
  //   }

  //   const updatedGroup = {
  //     ...group,
  //     members: [...group.members, { username: user.uname, role: "member" }],
  //   };
  //   const updatedGroups = [...groups];
  //   updatedGroups[groupIndex] = updatedGroup;

  //   setGroups(updatedGroups);
  //   localStorage.setItem("groups", JSON.stringify(updatedGroups));
  //   setJoinError("");
  //   setShowJoinModal(false);
  //   alert(`Joined group: ${group.name}`);
  // };
  const handleJoinGroup = async () => {
    try {
      const res = await API.post("/groups/join", { code: joinCode.trim() });
      alert(`Joined group: ${res.data.group.name}`);
      setJoinCode("");
      setShowJoinModal(false);
    } catch (err) {
      setJoinError(err.response?.data?.message || "Could not join group");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-teal-100">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen">
        <NavSidebar />
      </div>

      {/* Main */}
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        <h2 className="text-4xl font-extrabold text-center text-teal-800 mb-6 tracking-wide">
          Create / Join Group
        </h2>

        {/* Create Group Form */}
        <div className="flex justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-3xl border-t-4 border-teal-500">
            <h3 className="text-xl font-bold text-teal-700 mb-5 uppercase">
              Create Group
            </h3>
            <form className="flex flex-col gap-5">
              <div className="flex flex-col items-center mb-3">
                <img
                  className="w-24 h-24 rounded-full border-4 border-teal-900 shadow"
                  src="src/assets/grp_icon.png"
                  alt="Group Icon"
                />
              </div>
              <label className="text-teal-700 font-medium text-sm">
                Group Name *
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 w-full border border-teal-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </label>

              <label className="text-teal-700 font-medium text-sm">
                Group Description
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="mt-1 w-full border border-teal-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </label>

              {/* Members */}
              <div>
                <label className="text-teal-700 font-medium text-sm">
                  Add Members (by username)
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    list="membersList"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="flex-1 border border-teal-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                  <datalist id="membersList">
                    {users.map((each, i) => (
                      <option key={i} value={each.uname} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="bg-teal-600 text-white px-4 rounded hover:bg-teal-700 transition"
                  >
                    Add
                  </button>
                </div>
                {errorMsg && (
                  <p className="text-red-600 text-sm mt-1">{errorMsg}</p>
                )}
                <ul className="mt-2 list-disc list-inside text-xs text-teal-700">
                  {formData.members.map((m, i) => (
                    <li key={i}>{m.username}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handleCreateGroup}
                className="bg-teal-700 text-white px-4 py-2 mt-3 rounded shadow hover:bg-teal-800 transition font-semibold uppercase"
              >
                Create Group
              </button>
            </form>

            {successMsg && (
              <p className="mt-4 text-teal-700 font-semibold text-center">
                {successMsg}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 text-center text-teal-300 font-medium">
          —----- or ------—
        </div>

        {/* Join Group */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700 font-medium uppercase transition"
          >
            Join a Group
          </button>
        </div>

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-7 rounded-xl shadow-2xl w-96 border-t-4 border-teal-500">
              <h3 className="text-xl font-bold mb-4 text-teal-700">
                Join Group
              </h3>
              <input
                type="text"
                placeholder="Enter Group Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full border border-teal-300 rounded p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {joinError && (
                <p className="text-red-600 text-sm mb-2">{joinError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinGroup}
                  className="px-3 py-1 bg-teal-700 text-white rounded hover:bg-teal-800 transition font-semibold"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CreateGroup;
