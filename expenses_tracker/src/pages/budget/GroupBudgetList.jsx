// src/pages/budget/GroupBudgetList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavSidebar from "../../components/NavSidebar";
import API from "../../services/api";

function GroupBudgetList() {
  const [groups, setGroups] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))?.uname;

  useEffect(() => {
    // // Fetch all groups from localStorage
    // const storedGroups = JSON.parse(localStorage.getItem("groups")) || [];
    // // Optionally, filter by groups the current user is a member of
    // const userGroups = storedGroups.filter((g) =>
    //   g.members?.some((m) => m.username === currentUser)
    // );
    // setGroups(userGroups);
    const fetchUserGroups = async () => {
      try {
        const groupRes = await API.get(`/groups`);
        setGroups(groupRes.data);
      } catch (err) {
        console.error("Error fetching group info:", err);
      }
    };

    fetchUserGroups();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 z-20">
        <NavSidebar />
      </aside>

      <main className="flex-1 ml-64 min-h-screen overflow-y-auto p-10">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-purple-900 mb-2 tracking-tight">
              Your Groups
            </h2>
            <p className="text-purple-700 text-lg">
              Manage and view all your group budgets
            </p>
          </div>

          {!groups || groups.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md border border-purple-200 p-12 rounded-2xl shadow-xl text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-purple-900 mb-2">
                No Groups Yet
              </h3>
              <p className="text-purple-600 text-lg">
                You are not part of any groups yet. Create or join a group to
                get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((g, index) => (
                <Link
                  key={g.id}
                  to={`/budget/group/${g.id}`}
                  className="group block bg-white/80 backdrop-blur-md border border-purple-200 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:bg-white/95 hover:border-purple-400 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-lg">
                        {g.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-purple-900 mb-2 group-hover:text-purple-700 transition">
                    {g.name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-purple-600">
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="font-medium">Group Budget</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GroupBudgetList;
