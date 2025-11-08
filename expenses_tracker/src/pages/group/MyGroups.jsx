import NavSidebar from "../../components/NavSidebar";
import { useEffect, useState } from "react";
import { Users, Eye, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function MyGroups() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // useEffect(() => {
  //   const storedGroups = JSON.parse(localStorage.getItem("groups")) || [];

  //   // Show only groups where currentUser is a member
  //   const userGroups = storedGroups.filter((g) =>
  //     g.members?.some((m) => m.username === currentUser?.uname)
  //   );

  //   setGroups(userGroups);
  // }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get("/groups");
        setGroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGroups();
  }, []);

  const handleLeaveGroup = async (groupId) => {
    try {
      const res = await API.patch(`/groups/leave/${groupId}`);
      alert(res.data.message);

      // Remove the group from the frontend state if user is no longer a member
      setGroups((prevGroups) =>
        prevGroups.filter((g) =>
          g.members.some((m) => m.username === currentUser.uname)
        )
      );

      // Optionally, refetch groups from backend to ensure latest data
      const updatedGroups = await API.get("/groups");
      setGroups(updatedGroups.data);
    } catch (err) {
      console.error(err);
      alert("Error leaving group. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200">
      <div className="fixed top-0 left-0 h-screen">
        <NavSidebar />
      </div>
      <main className="flex-1 ml-64 p-10 min-h-screen overflow-y-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2 tracking-tight">
            My Groups
          </h1>
          <p className="text-emerald-700 text-lg">
            Manage your group memberships and collaborations
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md border border-emerald-200 p-12 rounded-2xl shadow-xl">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold text-emerald-900 mb-2">
                No Groups Yet
              </h2>
              <p className="text-emerald-600 text-lg">
                Join or create a group to get started with collaboration.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="group bg-white/80 backdrop-blur-md border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-white/95 hover:border-emerald-400 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center rounded-full text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform">
                    {group.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-emerald-900 group-hover:text-emerald-700 transition">
                      {group.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        {group.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-5 line-clamp-2 leading-relaxed">
                  {group.description || "No description available"}
                </p>

                <div className="flex justify-between gap-3 pt-4 border-t border-emerald-100">
                  <button
                    onClick={() => navigate(`/group/${group.id}`)}
                    className=" flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button
                    onClick={() => handleLeaveGroup(group.id)}
                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 py-2 px-4 rounded-lg text-sm font-semibold transition border border-red-200 hover:border-red-300"
                  >
                    <LogOut className="w-4 h-4" /> Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyGroups;
