// src/pages/group/GroupDetail.jsx
import NavSidebar from "../../components/NavSidebar";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GroupExpenses from "./GroupExpenses";
import GroupMembers from "./GroupMembers";
import API from "../../services/api";

const TABS = [
  { key: "expenses", label: "Expenses" },
  { key: "summary", label: "Summary" },
  { key: "members", label: "Members" },
];

function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses");
  const [groupExpenses, setGroupExpenses] = useState([]);

  // const loadGroupAndExpenses = () => {
  //   const groups = JSON.parse(localStorage.getItem("groups")) || [];
  //   const foundGroup = groups.find((g) => g.id === id);
  //   setGroup(foundGroup);

  //   const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  //   setGroupExpenses(expenses.filter((e) => e.groupId === id));
  // };

  const loadGroupAndExpenses = async () => {
    try {
      // Fetch group details
      const groupRes = await API.get(`/groups/${id}`);
      setGroup(groupRes.data);

      // Fetch expenses for this group
      const expensesRes = await API.get(`/expenses/${id}`);
      setGroupExpenses(expensesRes.data);
    } catch (err) {
      console.error("Failed to load group or expenses:", err);
    }
  };

  useEffect(() => {
    loadGroupAndExpenses();
  }, [id]);

  const handleExpensesChange = (newExpensesForGroup) => {
    setGroupExpenses(newExpensesForGroup || []);
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-tr from-green-200 via-cyan-100 to-indigo-200">
      <div className="fixed top-0 left-0 h-screen">
        <NavSidebar />
      </div>
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">
            Group Details
          </h1>

          {!group ? (
            <div className="flex items-center justify-center h-96 text-slate-400 text-xl rounded-xl bg-white shadow-lg">
              Group not found
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded-2xl p-8 min-h-[550px]">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center text-2xl font-bold text-sky-700 border-4 border-sky-200 shadow">
                  {group.icon && group.icon !== "/placeholder.png" ? (
                    <img
                      src={group.icon}
                      alt={group.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    group.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-sky-800 capitalize">
                    {group.name}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {group.description || "No description provided"}
                  </p>
                  <div className="mt-2 text-xs text-slate-400">
                    <span className="mr-2 font-medium">Group Code:</span>
                    <span className="font-mono bg-sky-100 px-2 py-0.5 rounded-md text-sky-800">
                      {group.code || group.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 border-b border-slate-200 mb-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-4 transition font-medium text-base rounded-t-lg ${
                      activeTab === tab.key
                        ? "bg-sky-100 text-sky-700 border-b-2 border-sky-500"
                        : "text-slate-400 hover:text-sky-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <section className="mt-6 min-h-[180px]">
                {activeTab === "expenses" && (
                  <GroupExpenses
                    groupMembers={group.members}
                    groupId={group.id}
                    onExpensesChange={handleExpensesChange}
                  />
                )}

                {activeTab === "summary" && (
                  <div>
                    <h2 className="text-lg font-semibold text-emerald-700 mb-4">
                      Expense Summary
                    </h2>

                    {groupExpenses.length === 0 ? (
                      <p className="text-slate-400">No expenses recorded yet</p>
                    ) : (
                      (() => {
                        const memberTotals = {};
                        group.members.forEach((m) => {
                          const name = typeof m === "string" ? m : m.username;
                          memberTotals[name] = { paid: 0, owed: 0 };
                        });

                        groupExpenses.forEach((exp) => {
                          exp.payers?.forEach((p) => {
                            if (memberTotals[p.name])
                              memberTotals[p.name].paid += p.amount;
                          });
                          if (exp.splits) {
                            Object.entries(exp.splits).forEach(
                              ([person, share]) => {
                                if (memberTotals[person])
                                  memberTotals[person].owed += share;
                              }
                            );
                          }
                        });

                        // Calculate net and check if all settled
                        let allSettled = true;
                        Object.values(memberTotals).forEach(
                          ({ paid, owed }) => {
                            if (Math.abs(paid - owed) > 0.01)
                              allSettled = false;
                          }
                        );

                        return (
                          <div className="space-y-6">
                            {allSettled && (
                              <div className="bg-green-100 text-green-800 p-4 rounded-xl font-semibold text-center">
                                ✅ All Settled! No Pending Balance
                              </div>
                            )}

                            {/* Member summary grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {Object.entries(memberTotals).map(
                                ([name, { paid, owed }], i) => {
                                  const net = paid - owed;
                                  const bgColor =
                                    net > 0
                                      ? "bg-green-50"
                                      : net < 0
                                      ? "bg-red-50"
                                      : "bg-yellow-50";
                                  const textColor =
                                    net > 0
                                      ? "text-green-700"
                                      : net < 0
                                      ? "text-red-800"
                                      : "text-yellow-800";

                                  return (
                                    <div
                                      key={i}
                                      className={`${bgColor} p-4 rounded-xl shadow flex flex-col gap-2`}
                                    >
                                      <h3
                                        className={`font-semibold text-lg ${textColor}`}
                                      >
                                        {name}
                                      </h3>
                                      <p>
                                        <span className="font-medium">
                                          Total Paid:
                                        </span>{" "}
                                        ₹{paid.toFixed(2)}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Total Owed:
                                        </span>{" "}
                                        ₹{owed.toFixed(2)}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Net Balance:
                                        </span>{" "}
                                        <span className={textColor}>
                                          ₹{net.toFixed(2)}
                                        </span>
                                      </p>
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            {/* Settlements section */}
                            {groupExpenses.some(
                              (e) => e.settlements?.length > 0
                            ) && (
                              <div className="space-y-4 mt-6">
                                {groupExpenses.map(
                                  (exp) =>
                                    exp.settlements?.length > 0 && (
                                      <div
                                        key={exp.id}
                                        className="p-4 bg-gray-50 rounded-xl shadow"
                                      >
                                        <h4 className="font-semibold mb-2 text-lg">
                                          Settlements for {exp.title}
                                        </h4>
                                        <ul className="list-disc ml-5">
                                          {exp.settlements.map((s, idx) => (
                                            <li key={idx}>
                                              <span className="text-red-700">
                                                {s.from}
                                              </span>{" "}
                                              pays{" "}
                                              <span className="text-green-700">
                                                {s.to}
                                              </span>{" "}
                                              <span className="font-semibold">
                                                ₹{s.amount.toFixed(2)}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}

                {activeTab === "members" && <GroupMembers group={group} />}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GroupDetail;
