import { useState } from "react";
import NavSidebar from "../../components/NavSidebar";
import axios from "axios";

function Capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function AddExpense() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(""); // 🔴 Validation error
  const [success, setSuccess] = useState(""); // 🟢 Success message

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic field-level validation
    if (!title.trim()) {
      setError("Expense title is required.");
      setSuccess("");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount greater than 0.");
      setSuccess("");
      return;
    }
    if (category === "Other" && !customCategory.trim()) {
      setError("Please specify a custom category.");
      setSuccess("");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      setSuccess("");
      return;
    }

    setError(""); // clear any old error

    const finalCategory =
      category === "Other" && customCategory ? customCategory : category;

    const newExpense = {
      id: Date.now(),
      user: currentUser?.uname || "unknown",
      title,
      amount: parseFloat(amount),
      category: finalCategory,
      description,
      createdAt: date,
    };

    try {
      await axios.post("http://localhost:5000/expenses/personal", newExpense, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Reset form fields
      setTitle("");
      setAmount("");
      setCategory("");
      setCustomCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);

      // Show success message
      setSuccess("Expense added successfully!");

      // Auto-hide success after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add expense");
      setSuccess("");
      alert(err.response?.data?.message || "Could not add expense");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-sky-100">
      <div className="fixed top-0 left-0 h-screen">
        <NavSidebar />
      </div>
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-extrabold text-sky-900 mb-8 tracking-wide">
            Add Expense
          </h2>

          {/* Card */}
          <div className="bg-white/90 shadow-2xl rounded-2xl p-8 w-full max-w-2xl border border-sky-200 backdrop-blur-md">
            {/* Sub-header */}
            <div className="flex items-center mb-6 gap-3">
              <div className="w-11 h-11 bg-sky-200 rounded-full flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-sky-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4l3 1m9 4.84V7a2 2 0 0 0-2-2h-3V3a2 2 0 0 0-2-2H8A2 2 0 0 0 6 3v2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-sky-800 tracking-wide">
                Expense Details
              </span>
            </div>

            {/* 🧩 Inline Error or Success Message */}
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

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 mt-1"
              autoComplete="off"
            >
              {/* Expense Title */}
              <div>
                <label className="block text-base font-medium text-sky-700 mb-1">
                  Expense Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter Expense Title"
                  className="w-full border border-sky-300 bg-sky-50/60 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-base font-medium text-sky-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter Amount"
                  min="0"
                  step="0.01"
                  className="w-full border border-sky-300 bg-sky-50/60 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-base font-medium text-sky-700 mb-1">
                  Category
                </label>
                <input
                  list="categories"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-sky-300 bg-sky-50/60 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
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

                {category === "Other" && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter Custom Category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="flex-1 border border-sky-300 bg-sky-50/60 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
                    />
                    {customCategory && (
                      <span className="inline-block bg-sky-200/70 text-sky-800 font-medium px-3 py-1 rounded-full text-xs select-none">
                        {Capitalize(customCategory)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-base font-medium text-sky-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-sky-300 bg-sky-50/60 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-base font-medium text-sky-700 mb-1">
                  Description
                  <span className="ml-2 font-normal text-sky-500 text-xs">
                    (optional)
                  </span>
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Add an optional note"
                  className="w-full border border-sky-300 bg-sky-50/60 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-2 py-2 px-4 bg-sky-700 hover:bg-sky-900 text-white font-bold rounded-xl shadow transition duration-200 text-lg tracking-wide"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddExpense;
