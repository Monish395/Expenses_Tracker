import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import API from "../services/API";
import {
  User,
  PlusCircle,
  Users,
  Wallet,
  ArrowRightCircle,
  Clock,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [personalExpenses, setPersonalExpenses] = useState([]);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch groups the user belongs to
        const groupsRes = await API.get("/groups");
        const myGroups = groupsRes.data || [];
        setGroups(myGroups);

        // 2️⃣ Fetch personal expenses
        const personalRes = await API.get("/expenses/personal");
        setPersonalExpenses(personalRes.data || []);

        // 3️⃣ Fetch expenses for user's groups
        const groupExpRes = await API.get("/expenses/group/all");
        setGroupExpenses(groupExpRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.uname, currentUser?.email]);

  const totalPersonal = personalExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );
  const totalGroup = groupExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  const recentExpenses = [...personalExpenses, ...groupExpenses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <AppLayout bgClassName="bg-[rgb(240,240,240)]">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
        Welcome, {currentUser.uname} 👋
      </h1>

      {/* Profile Snapshot */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md mb-8 flex items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-xl">
          {currentUser.uname.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-800 truncate">
            {currentUser.uname}
          </p>
          <p className="text-sm text-slate-500 truncate">{currentUser.email}</p>
        </div>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <p className="p-6 text-slate-700">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-emerald-100 p-5 rounded-xl shadow hover:shadow-lg transition">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <Wallet className="w-5 h-5 shrink-0" />
                <span className="font-semibold">Personal Expenses</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900">
                ₹{totalPersonal.toFixed(2)}
              </p>
            </div>

            <div className="bg-indigo-100 p-5 rounded-xl shadow hover:shadow-lg transition">
              <div className="flex items-center gap-2 text-indigo-700 mb-2">
                <Users className="w-5 h-5 shrink-0" />
                <span className="font-semibold">Group Expenses</span>
              </div>
              <p className="text-2xl font-bold text-indigo-900">
                ₹{totalGroup.toFixed(2)}
              </p>
            </div>

            <div className="bg-orange-100 p-5 rounded-xl shadow hover:shadow-lg transition">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <User className="w-5 h-5 shrink-0" />
                <span className="font-semibold">Groups Joined</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {groups.length}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md mb-8">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-5 h-5 text-sky-600 shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-sky-700 truncate">
                  Recent Expenses
                </h2>
              </div>
              <button
                onClick={() => navigate("/viewexpense")}
                className="text-sm text-sky-600 hover:underline shrink-0"
              >
                View All
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <p className="text-slate-400">No expenses recorded yet</p>
            ) : (
              <ul className="divide-y">
                {recentExpenses.map((exp) => (
                  <li
                    key={exp.id}
                    className="py-3 flex justify-between items-center gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {exp.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(exp.createdAt).toLocaleDateString("en-GB")}{" "}
                        • {exp.groupId ? "Group" : "Personal"}
                      </p>
                    </div>
                    <p className="font-semibold text-indigo-700 shrink-0">
                      ₹{exp.amount}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <button
          onClick={() => navigate("/addexpense")}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl shadow hover:shadow-lg transition"
        >
          <PlusCircle className="w-6 h-6 shrink-0" />
          <span className="text-base sm:text-lg font-semibold">
            Add Personal Expense
          </span>
        </button>

        <button
          onClick={() => navigate("/mygroups")}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-4 rounded-xl shadow hover:shadow-lg transition"
        >
          <ArrowRightCircle className="w-6 h-6 shrink-0" />
          <span className="text-base sm:text-lg font-semibold">
            Go to My Groups
          </span>
        </button>
      </div>
    </AppLayout>
  );
}

export default Home;
