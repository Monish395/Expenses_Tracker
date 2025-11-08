import { useState, useEffect } from "react";
import NavSidebar from "../../components/NavSidebar";
import Modal from "../../components/Modal";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import axios from "axios";

function ExpenseRow({ expense, index, onEdit, onDelete }) {
  const [year, month, day] = expense.createdAt.split("-");
  const formatted = `${day}/${month}/${year}`;
  return (
    <tr className="border-b even:bg-blue-100 hover:bg-indigo-200 relative group">
      <td className="px-4 py-3">{index + 1}</td>
      <td className="px-4 py-3">
        {expense.title.charAt(0).toUpperCase() + expense.title.slice(1)}
      </td>
      <td className="px-4 py-3 font-medium text-indigo-800">
        ₹{expense.amount}
      </td>
      <td className="px-4 py-3">{expense.category || "-"}</td>
      <td className="px-4 py-3">{expense.description || "-"}</td>
      <td className="px-4 py-3">{formatted}</td>
      <td className="text-left">
        <abbr title="Edit Expense">
          <button
            onClick={() => onEdit(index)}
            className="hidden group-hover:inline-flex p-2 rounded-full hover:bg-indigo-300"
          >
            <Pencil size={18} />
          </button>
        </abbr>
        <abbr title="Delete Expense">
          <button
            onClick={onDelete}
            className="hidden group-hover:inline-flex p-2 rounded-full hover:bg-red-400"
          >
            <Trash2 size={16} />
          </button>
        </abbr>
      </td>
    </tr>
  );
}

function ViewExpense() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [expenses, setExpenses] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔑 Fetch user expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/expenses/personal", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setExpenses(res.data);
      } catch (err) {
        console.error(err);
        setError("Could not fetch expenses");
        setTimeout(() => setError(""), 3000);
      }
    };

    fetchExpenses();
  }, []);

  // 🧩 Edit logic
  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData({ ...expenses[index] });
  };

  const handleSave = async () => {
    const updatedExpense = { ...formData };
    try {
      const res = await axios.put(
        `http://localhost:5000/expenses/personal/${updatedExpense.id}`,
        updatedExpense,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedExpenses = [...expenses];
      updatedExpenses[editingIndex] = res.data;
      setExpenses(updatedExpenses);
      setEditingIndex(null);
      setSuccess("Expense updated successfully!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Could not update expense");
      setSuccess("");
      alert(err.response?.data?.message || "Could not update expense");
    }
  };

  // 🗑️ Delete logic
  const handleDelete = async () => {
    const expenseToDelete = selectedExpense || formData;
    if (!expenseToDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/expenses/personal/${expenseToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedExpenses = expenses.filter(
        (e) => e.id !== expenseToDelete.id
      );
      setExpenses(updatedExpenses);
      setSelectedExpense(null);
      setEditingIndex(null);
      setFormData(null);
      setSuccess("Expense deleted successfully!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Could not delete expense");
      setSuccess("");
      alert(err.response?.data?.message || "Could not delete expense");
    }
  };

  const handleReset = () => {
    setFormData({ ...expenses[editingIndex] });
  };

  return (
    <div className="flex min-h-screen w-full bg-indigo-50">
      <div className="fixed top-0 left-0 h-screen">
        <NavSidebar />
      </div>

      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        <h2 className="text-3xl font-bold text-indigo-900 mb-6">
          View / Edit Expenses
        </h2>

        {expenses.length === 0 ? (
          <p className="text-gray-600">No expenses added yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-xl rounded-lg border border-indigo-200">
            {/* 🔴 Error + 🟢 Success banners */}
            {error && (
              <div
                className="text-red-600 bg-red-50 border border-red-300 rounded-lg px-4 py-2 mb-4 text-center font-medium tracking-wide"
                id="validation-error"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="text-green-700 bg-green-100 border border-green-300 rounded-lg px-4 py-2 mb-4 text-center font-semibold tracking-wide shadow-sm"
                id="validation-success"
              >
                {success}
              </div>
            )}

            <table className="w-full border-collapse rounded-lg overflow-hidden">
              <thead className="bg-indigo-300 text-indigo-900">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={() => {
                      setSelectedExpense(expense);
                      setIsDeleteOpen(true);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------- Delete Confirmation Modal ---------- */}
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedExpense(null);
          }}
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
              onClick={() => {
                handleDelete();
                setIsDeleteOpen(false);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Modal>

        {/* ---------- Edit Modal ---------- */}
        {editingIndex !== null && (
          <div className="fixed inset-0 bg-gray-400/25 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-96">
              <h3 className="text-2xl font-semibold mb-4 text-indigo-900">
                Edit Expense
              </h3>

              <form className="flex flex-col gap-4">
                <label className="flex flex-col text-sm font-medium text-gray-700">
                  Title
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex flex-col text-sm font-medium text-gray-700">
                  Amount
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex flex-col text-sm font-medium text-gray-700">
                  Category
                  <input
                    list="categories"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-indigo-500"
                  />
                  <datalist id="categories">
                    <option value="Food & Dining" />
                    <option value="Shopping" />
                    <option value="Travel/Transport" />
                    <option value="Housing & Utilities" />
                    <option value="Health & Wellness" />
                    <option value="Entertainment" />
                    <option value="Education" />
                    <option value="Personal Care" />
                    <option value="Investments & Savings" />
                    <option value="Other" />
                  </datalist>
                </label>

                {formData.category === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    value={formData.customCategory || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customCategory: e.target.value,
                        category: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-indigo-500"
                  />
                )}

                <label className="flex flex-col text-sm font-medium text-gray-700">
                  Date
                  <input
                    type="date"
                    value={formData.createdAt}
                    onChange={(e) =>
                      setFormData({ ...formData, createdAt: e.target.value })
                    }
                    className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex flex-col text-sm font-medium text-gray-700">
                  Description
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </form>

              {/* Action buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center bg-gray-300 gap-1 px-3 py-1 border rounded hover:bg-gray-400"
                >
                  <RotateCcw size={16} /> Reset
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="px-3 py-1 text-white bg-indigo-600 border rounded hover:bg-indigo-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ViewExpense;
