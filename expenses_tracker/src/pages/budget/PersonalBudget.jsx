import { useState, useEffect } from "react";
import NavSidebar from "../../components/NavSidebar";
import API from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function PersonalBudget() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const username = currentUser?.uname;

  // const storageKey = `personalBudget_${username}`;
  // const [budgetData, setBudgetData] = useState(() => {
  //   const saved = JSON.parse(localStorage.getItem(storageKey));
  //   return saved || null;
  // });

  const [budgetData, setBudgetData] = useState({});
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("weekly");
  const [expenses, setExpenses] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [personalExpenses, setPersonalExpenses] = useState([]);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [editing, setEditing] = useState(false); // <-- edit state

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await API.get("/budgets/personal");
        setBudgetData(res.data);
        if (res.data) {
          setAmount(res.data.amount);
          setInterval(res.data.interval);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBudget();
  }, []);

  // useEffect(() => {
  //   const allExpenses = JSON.parse(localStorage.getItem("expenses")) || [];

  //   const personal = allExpenses.filter((e) => e.user === username);

  //   const allGroups = JSON.parse(localStorage.getItem("groups")) || [];
  //   const userGroupIds = allGroups
  //     .filter((g) => g.members?.some((m) => m.username === username))
  //     .map((g) => g.id);

  //   const groupExp = allExpenses
  //     .filter((e) => e.groupId && userGroupIds.includes(e.groupId))
  //     .map((e) => ({ ...e, amount: e.splits?.[username] || 0 }));

  //   setExpenses([...personal, ...groupExp]);
  // }, [username]);
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const res = await API.get("/groups"); // JWT required
        setUserGroups(res.data || []); // store groups in state
      } catch (err) {
        console.error(err);
        alert("Failed to fetch groups");
      }
    };
    fetchUserGroups();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // 1. Personal expenses
        const personalRes = await API.get("/expenses/personal");
        const personal = personalRes.data || [];

        // 2. Group expenses for all user groups
        const groupRes = await API.get("/expenses/group/all");
        const groups = groupRes.data || [];

        setExpenses([...personal, ...groups]);
        setPersonalExpenses(personal);
        setGroupExpenses(groups);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch expenses");
      }
    };

    if (userGroups.length) fetchExpenses();
  }, [userGroups]);

  const getDateRange = () => {
    const today = new Date();
    let start;
    if (budgetData?.interval === "weekly") {
      start = new Date(today);
      start.setDate(today.getDate() - 6);
    } else if (budgetData?.interval === "monthly") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      start = new Date(today.getFullYear(), 0, 1);
    }

    const dates = [];
    const current = new Date(start);
    while (current <= today) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const chartData = (() => {
    if (!budgetData) return [];
    const dates = getDateRange();
    let cumulative = 0;
    return dates.map((d) => {
      expenses.forEach((e) => {
        if (new Date(e.createdAt).toDateString() === d.toDateString()) {
          cumulative += Number(e.amount || 0);
        }
      });
      return { date: d.toISOString().split("T")[0], cumulative };
    });
  })();

  const totalSpent = chartData.length
    ? chartData[chartData.length - 1].cumulative
    : 0;
  const remaining = budgetData
    ? (budgetData.amount - totalSpent).toFixed(2)
    : 0;
  const progress = budgetData
    ? Math.min((totalSpent / budgetData.amount) * 100, 100)
    : 0;

  const daysInPeriod = budgetData
    ? budgetData.interval === "weekly"
      ? 7
      : budgetData.interval === "monthly"
      ? 30
      : 365
    : 1;
  const dailyAvg = (daysInPeriod > 0 ? totalSpent / daysInPeriod : 0).toFixed(
    2
  );
  const dailyRecommended = (
    daysInPeriod > 0 ? budgetData.amount / daysInPeriod : 0
  ).toFixed(2);
  const daysLeft =
    dailyAvg > 0
      ? Math.max(Math.floor((budgetData.amount - totalSpent) / dailyAvg), 0)
      : 0;

  // const handleSetBudget = (e) => {
  //   e.preventDefault();
  //   if (!amount) return;
  //   const data = { amount: Number(amount), interval };
  //   localStorage.setItem(storageKey, JSON.stringify(data));
  //   setBudgetData(data);
  //   setEditing(false); // exit edit mode
  // };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!amount) return;

    try {
      const res = await API.post("/budgets/personal", {
        amount: Number(amount),
        interval,
      });
      setBudgetData(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save budget");
    }
  };

  return (
    <div className="flex min-h-screen bg-purple-100">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900 z-20">
        <NavSidebar />
      </aside>

      <main className="flex-1 ml-64 min-h-screen overflow-y-auto p-8">
        <div className="w-full max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-900">
              {username}'s Budget Plan
            </h2>
            {budgetData && (
              <button
                onClick={() => {
                  setAmount(budgetData.amount);
                  setInterval(budgetData.interval);
                  setEditing(true);
                }}
                className="bg-purple-600 text-white px-4 py-1 rounded-lg hover:bg-purple-800"
              >
                Edit
              </button>
            )}
          </div>

          {/* Edit / Set Budget Form */}
          {(!budgetData || editing) && (
            <div className="bg-white shadow-lg rounded-2xl p-6 w-full mb-6">
              <form onSubmit={handleSetBudget} className="space-y-6">
                <div>
                  <label className="block font-medium text-purple-800">
                    Budget Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-2 p-2 border-2 border-purple-400 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    placeholder="e.g., 5000"
                  />
                </div>

                <div>
                  <h3 className="font-medium text-purple-800">
                    Select Interval
                  </h3>
                  <div className="flex gap-6 mt-2">
                    {["weekly", "monthly", "yearly"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="interval"
                          value={opt}
                          checked={interval === opt}
                          onChange={(e) => setInterval(e.target.value)}
                        />
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-900 text-white py-2 rounded-lg font-semibold"
                >
                  Save
                </button>
              </form>
            </div>
          )}

          {/* Budget Display */}
          {budgetData && !editing && (
            <div className="bg-white shadow-lg rounded-2xl p-6 w-full space-y-6">
              <p>
                <span className="font-semibold">Budget:</span> ₹
                {budgetData.amount} / {budgetData.interval}
              </p>
              <p>
                <span className="font-semibold">Total Spent:</span> ₹
                {totalSpent.toFixed(2)}
              </p>
              <p>
                <span className="font-semibold">Remaining:</span> ₹{remaining}
              </p>

              <div className="w-full bg-purple-200 rounded-full h-6 relative">
                <div
                  className="bg-purple-600 h-6 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
                <span className="absolute right-2 top-1 text-white font-semibold">
                  {progress.toFixed(1)}%
                </span>
              </div>

              <div className="bg-purple-50 h-56 rounded-2xl shadow-md p-2">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-purple-400">
                    No data to display
                  </div>
                )}
              </div>

              <div className="flex justify-between text-purple-900 font-medium">
                <p>Daily Avg: ₹{dailyAvg}</p>
                <p>Daily Recommended: ₹{dailyRecommended}</p>
              </div>
              {/* Insights */}
              <div className="mt-4 p-4 bg-purple-50 rounded-xl shadow-inner text-purple-900 font-medium">
                {totalSpent > budgetData.amount ? (
                  <p className="text-red-600 font-semibold">
                    ⚠️ You have exceeded your budget!
                  </p>
                ) : totalSpent / budgetData.amount > 0.8 ? (
                  <p className="text-yellow-600 font-semibold">
                    🔔 You are close to reaching your budget limit.
                  </p>
                ) : (
                  <p className="text-green-600 font-semibold">
                    ✅ You are within your budget. Keep it up!
                  </p>
                )}
                <p>
                  At your current spending rate (₹{dailyAvg}/day), your budget
                  will last for{" "}
                  <span className="font-semibold">{daysLeft}</span> more day(s).
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PersonalBudget;
