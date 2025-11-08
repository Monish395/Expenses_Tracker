// src/pages/group/GroupExpenses.jsx
import { useState, useEffect } from "react";
import { Pencil, Trash2, Divide } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import SplitExpense from "./SplitExpense";
import Modal from "../../components/Modal";
import { calculateExpense } from "../../utils/CalculateExpense";
import API from "../../services/api";

function GroupExpenses({ groupMembers, groupId, onExpensesChange }) {
  // const [expenses, setExpenses] = useState(() => {
  //   const stored = JSON.parse(localStorage.getItem("expenses")) || [];
  //   const flat = Array.isArray(stored) ? stored.flat(Infinity) : [];
  //   return flat.filter((e) => e.groupId === groupId);
  // });

  // const syncGlobal = (newExpensesForGroup) => {
  //   const allRaw = JSON.parse(localStorage.getItem("expenses")) || [];
  //   const all = Array.isArray(allRaw) ? allRaw.flat(Infinity) : [];
  //   const others = all.filter((e) => e.groupId !== groupId);
  //   const merged = [...others, ...newExpensesForGroup];
  //   localStorage.setItem("expenses", JSON.stringify(merged));
  //   setExpenses(newExpensesForGroup);
  //   if (onExpensesChange) onExpensesChange(newExpensesForGroup);
  // };

  const [expenses, setExpenses] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await API.get(`/expenses/${groupId}`);
      setExpenses(res.data);
      if (onExpensesChange) onExpensesChange(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load expenses");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [groupId]);

  const handleAddClick = () => setIsAddOpen(true);
  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setIsEditOpen(true);
  };
  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setIsDeleteOpen(true);
  };
  const handleViewClick = (expense) => {
    setSelectedExpense(expense);
    setIsViewOpen(true);
  };
  const handleSplitClick = (expense) => {
    setSelectedExpense(expense);
    setIsSplitOpen(true);
  };

  // --- Backend operations ---
  const addExpense = async (data) => {
    const newExpense = { ...data, groupId };
    const { splits, netBalances, settlements } = calculateExpense(newExpense);
    newExpense.splits = splits;
    newExpense.netBalances = netBalances;
    newExpense.settlements = settlements;
    newExpense.id = Date.now().toString();
    newExpense.createdAt = newExpense.createdAt || new Date().toISOString();

    try {
      await API.post("/expenses", newExpense);
      fetchExpenses();
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    }
  };

  const updateExpense = async (updatedExpense) => {
    const { splits, netBalances, settlements } = calculateExpense(
      updatedExpense,
      updatedExpense.splits
    );
    const payload = { ...updatedExpense, splits, netBalances, settlements };
    console.log("PATCH payload:", payload);
    try {
      await API.patch(`/expenses/${updatedExpense.id}`, payload);
      console.log("success");
      fetchExpenses();
      setIsEditOpen(false);
      setIsSplitOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update expense");
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await API.delete(`/expenses/${expenseId}`);
      fetchExpenses();
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-emerald-700 mb-2">
          Group Expenses
        </h2>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 text-white rounded-3xl bg-emerald-500 hover:bg-emerald-700"
        >
          Add
        </button>
      </div>

      {expenses.length === 0 ? (
        <p className="text-slate-400 mb-4">No expenses yet. Add one soon!</p>
      ) : (
        <>
          <p className="text-slate-500 text-sm mb-2">
            Click on an expense for more details
          </p>
          <table className="w-full border-collapse rounded-lg overflow-hidden border border-emerald-800">
            <thead className="bg-emerald-100">
              <tr>
                <th className="p-2 text-center">#</th>
                <th className="p-2 text-center">Title</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, idx) => (
                <tr
                  key={exp.id}
                  onClick={() => handleViewClick(exp)}
                  className="border-t hover:bg-emerald-50 cursor-pointer"
                >
                  <td className="p-2 text-center">{idx + 1}</td>
                  <td className="p-2 text-center">{exp.title}</td>
                  <td className="p-2 text-center">₹{exp.amount}</td>
                  <td className="p-2 text-center">
                    {exp.createdAt
                      ? new Date(exp.createdAt).toLocaleDateString("en-GB")
                      : "Not specified"}
                  </td>
                  <td className="p-2 text-center">
                    <div
                      className="flex justify-center gap-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEditClick(exp)}
                        className="text-emerald-600"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleSplitClick(exp)}
                        className="text-sky-600"
                      >
                        <Divide size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(exp)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Expense"
      >
        <ExpenseForm
          key={"add"}
          mode="add"
          groupId={groupId}
          groupMembers={groupMembers || []}
          initialData={{}}
          onSave={addExpense}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      {/* Split Modal */}
      <Modal
        isOpen={isSplitOpen}
        onClose={() => setIsSplitOpen(false)}
        title="Split Expense"
      >
        {selectedExpense && (
          <SplitExpense
            selectedExpense={selectedExpense}
            onSave={updateExpense}
            onCancel={() => setIsSplitOpen(false)}
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Expense"
      >
        {selectedExpense && (
          <ExpenseForm
            key={selectedExpense.id}
            mode="edit"
            groupId={groupId}
            groupMembers={groupMembers || []}
            initialData={selectedExpense}
            onSave={updateExpense}
            onCancel={() => setIsEditOpen(false)}
          />
        )}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Delete"
      >
        <p className="mb-4">Are you sure you want to delete this expense?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsDeleteOpen(false)}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedExpense && deleteExpense(selectedExpense.id)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* View Expense Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Expense Details"
      >
        {selectedExpense && (
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Title:</span>{" "}
              {selectedExpense.title}
            </p>
            <p>
              <span className="font-semibold">Amount:</span> ₹
              {selectedExpense.amount}
            </p>

            {/* Show Payers */}
            <div>
              <h4 className="font-medium">Paid By</h4>
              {selectedExpense.payers?.length > 0 ? (
                <ul className="list-disc ml-5 text-slate-900">
                  {selectedExpense.payers.map((p, i) => (
                    <li key={i}>
                      {p.name} {p.amount !== undefined ? `– ₹${p.amount}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">Not specified</p>
              )}
            </div>

            {/* Show Participants */}
            <div>
              <h4 className="font-medium">Participants</h4>
              {selectedExpense.participants?.length > 0 ? (
                <ul className="list-disc ml-5 text-slate-900">
                  {selectedExpense.participants.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No participants specified</p>
              )}
            </div>

            <p>
              <span className="font-semibold">Date:</span>{" "}
              {selectedExpense.createdAt
                ? new Date(selectedExpense.createdAt).toLocaleDateString(
                    "en-GB"
                  )
                : "Not specified"}
            </p>
            <p>
              <span className="font-semibold">Description:</span>{" "}
              {selectedExpense.description || "-"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default GroupExpenses;
