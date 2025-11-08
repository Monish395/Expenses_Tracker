import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

function GroupBudget() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("weekly");
  const [editing, setEditing] = useState(false);

  // Fetch group details, expenses & budget
  useEffect(() => {
    const fetchData = async () => {
      // Fetch group info
      try {
        const groupRes = await API.get(`/groups/${groupId}`);
        setGroup(groupRes.data);
      } catch (err) {
        console.error("Error fetching group info:", err);
        setGroup({ name: "Unknown Group", id: groupId });
      }

      try {
        // const allGroups = JSON.parse(localStorage.getItem("groups")) || [];
        // const currentGroup = allGroups.find((g) => g.id === groupId);
        // setGroup(currentGroup || { name: "Unknown Group", id: groupId });

        // Fetch expenses for this group
        const expRes = await API.get(`/expenses/${groupId}`);
        setGroupExpenses(expRes.data || []);

        // Fetch group budget
        const budgetRes = await API.get(`/budgets/group/${groupId}`);
        if (budgetRes.data) {
          setBudgetData(budgetRes.data);
          setAmount(budgetRes.data.amount);
          setInterval(budgetRes.data.interval);
        }
      } catch (err) {
        console.error("Error fetching group budget data:", err);
      }
    };

    fetchData();
  }, [groupId]);

  const totalSpent = groupExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );
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

  const dailyAvg = (totalSpent / daysInPeriod).toFixed(2);
  const dailyRecommended = (budgetData?.amount / daysInPeriod).toFixed(2);

  // Save or update budget via backend
  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!amount) return;

    try {
      const res = await API.post(`/budgets/group/${groupId}`, {
        amount: Number(amount),
        interval,
      });
      setBudgetData(res.data);
      setEditing(false);
    } catch (err) {
      console.error("Error saving budget:", err);
    }
  };

  // Prepare chart data
  const chartData = (() => {
    if (!budgetData) return [];

    const today = new Date();
    let startDate;
    if (budgetData.interval === "weekly") {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 6
      );
    } else if (budgetData.interval === "monthly") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    const dates = [];
    const current = new Date(startDate);
    while (current <= today) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    let cumulative = 0;
    return dates.map((d) => {
      groupExpenses.forEach((e) => {
        const expenseDate = new Date(e.createdAt);
        if (expenseDate.toDateString() === d.toDateString()) {
          cumulative += Number(e.amount);
        }
      });
      return { date: d.toISOString().split("T")[0], cumulative };
    });
  })();

  return (
    <div className="flex min-h-screen bg-purple-100">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900 z-20">
        <NavSidebar />
      </aside>

      <main className="flex-1 ml-64 min-h-screen overflow-y-auto p-8">
        <div className="w-full max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-900">
              {group?.name}'s Budget Plan
            </h2>
            {budgetData && (
              <button
                onClick={() => setEditing(true)}
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
                    placeholder="e.g., 50000"
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
                  <span className="font-semibold">
                    {Math.max(
                      Math.floor((budgetData.amount - totalSpent) / dailyAvg),
                      0
                    )}
                  </span>{" "}
                  more day(s).
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GroupBudget;
