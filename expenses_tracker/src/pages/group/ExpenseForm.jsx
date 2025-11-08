// src/pages/group/ExpenseForm.jsx
import { useState, useEffect } from "react";
import {
  Receipt,
  DollarSign,
  Calendar,
  User,
  Users,
  FileText,
  Plus,
  X,
  Save,
  Trash2,
  RotateCcw,
  Tag,
} from "lucide-react";

function ExpenseForm({
  mode = "add",
  groupMembers = [],
  initialData = {},
  onSave,
  onCancel,
  onDelete,
  onReset,
  groupId,
}) {
  const [title, setTitle] = useState(() => initialData.title ?? "");
  const [amount, setAmount] = useState(() =>
    initialData.amount !== undefined ? String(initialData.amount) : ""
  );
  const [category, setCategory] = useState(
    () => initialData.category ?? "Food & Dining"
  );
  const [date, setDate] = useState(
    initialData.createdAt
      ? new Date(initialData.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(
    () => initialData.description ?? ""
  );

  // ✅ payers will be array of { name, amount }
  const [payers, setPayers] = useState(() =>
    Array.isArray(initialData.payers)
      ? initialData.payers
      : initialData.payer
      ? [{ name: initialData.payer, amount: initialData.amount || 0 }]
      : []
  );

  const [selectedPayer, setSelectedPayer] = useState("");
  const [payerAmount, setPayerAmount] = useState("");
  const [participants, setParticipants] = useState(
    () => initialData.participants ?? []
  );
  const [newParticipant, setNewParticipant] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setDate(
      initialData.createdAt
        ? new Date(initialData.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setTitle(initialData.title ?? "");
    setAmount(
      initialData.amount !== undefined ? String(initialData.amount) : ""
    );
    setCategory(initialData.category ?? "Food & Dining");
    setDescription(initialData.description ?? "");
    setPayers(
      Array.isArray(initialData.payers)
        ? initialData.payers
        : initialData.payer
        ? [{ name: initialData.payer, amount: initialData.amount || 0 }]
        : []
    );
    setParticipants(initialData.participants ?? []);
    setNewParticipant("");
    setErrors({});
  }, [initialData]);

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (field === "title") {
      if (!value.trim()) newErrors.title = "Title is required";
      else delete newErrors.title;
    }
    if (field === "amount") {
      const n = parseFloat(value);
      if (!value || isNaN(n) || n <= 0) newErrors.amount = "Enter valid amount";
      else delete newErrors.amount;
    }
    if (field === "payers") {
      if (!value || value.length === 0)
        newErrors.payers = "Specify at least one payer";
      else delete newErrors.payers;
    }
    setErrors(newErrors);
  };

  const handleAddPayer = () => {
    if (!selectedPayer || !payerAmount) return;
    const num = parseFloat(payerAmount);
    if (isNaN(num) || num <= 0) return;

    // Prevent duplicates
    if (payers.some((p) => p.name === selectedPayer)) return;

    setPayers((prev) => [...prev, { name: selectedPayer, amount: num }]);
    setSelectedPayer("");
    setPayerAmount("");
  };

  const handleRemovePayer = (name) => {
    setPayers((prev) => prev.filter((p) => p.name !== name));
  };

  const totalPaid = payers.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = parseFloat(amount) || 0;

  function handleSubmit(e) {
    e.preventDefault();

    validateField("title", title);
    validateField("amount", amount);
    validateField("payers", payers);

    if (
      Object.keys(errors).length > 0 ||
      !title.trim() ||
      !amount ||
      payers.length === 0
    ) {
      return;
    }

    if (totalPaid !== totalExpense) {
      alert(
        `Total paid (${totalPaid}) must equal total expense (${totalExpense})`
      );
      return;
    }

    const base = {
      id: initialData.id ?? Date.now().toString(),
      title: title.trim(),
      amount: totalExpense,
      category,
      description: description.trim(),
      payers,
      participants,
      createdAt: date,
      groupId: groupId ?? initialData.groupId ?? null,
    };

    // If editing and there are existing computed fields, preserve them unless caller chooses otherwise.
    // ExpenseForm should not drop previously computed splits/netBalances/settlements on save.
    const expenseData = {
      ...base,
      // prefer updated fields from form, otherwise keep existing ones
      splits: initialData.splits ?? base.splits ?? {},
      netBalances: initialData.netBalances ?? base.netBalances,
      settlements: initialData.settlements ?? base.settlements ?? [],
    };

    onSave?.(expenseData);
  }

  const handleResetLocal = () => {
    setTitle(initialData.title ?? "");
    setAmount(
      initialData.amount !== undefined ? String(initialData.amount) : ""
    );
    setCategory(initialData.category ?? "Food & Dining");
    setDescription(initialData.description ?? "");
    setPayers(
      Array.isArray(initialData.payers)
        ? initialData.payers
        : initialData.payer
        ? [{ name: initialData.payer, amount: initialData.amount || 0 }]
        : []
    );
    setParticipants(initialData.participants ?? []);
    setNewParticipant("");
    setErrors({});
    if (onReset) onReset();
  };

  const handleAddParticipant = () => {
    const p = newParticipant.trim();
    if (!p) return;
    if (!participants.includes(p)) setParticipants((prev) => [...prev, p]);
    setNewParticipant("");
  };

  const handleRemoveParticipant = (p) => {
    setParticipants((prev) => prev.filter((x) => x !== p));
  };

  const categoryIcons = {
    "Food & Dining": "🍽️",
    Shopping: "🛒",
    "Travel/Transport": "✈️",
    "Housing & Utilities": "🏠",
    "Health & Wellness": "💊",
    Entertainment: "🎬",
    Education: "📚",
    "Personal Care": "💄",
    "Investments & Savings": "💰",
    Other: "📦",
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
        <div className="flex items-center gap-3">
          <Receipt className="w-7 h-7" />
          <div>
            <h2 className="text-2xl font-bold">
              {mode === "add" ? "Add New Expense" : "Edit Expense"}
            </h2>
            <p className="text-blue-100 text-sm">
              {mode === "add"
                ? "Create a new expense entry"
                : "Update expense details"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Receipt className="w-4 h-4" />
              Expense Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                validateField("title", e.target.value);
              }}
              required
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 ${
                errors.title
                  ? "border-red-300 bg-red-50 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-500"
              }`}
              placeholder="e.g., Dinner at Italian Restaurant"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <DollarSign className="w-4 h-4" />
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  validateField("amount", e.target.value);
                }}
                required
                className={`w-full border-2 rounded-xl pl-8 pr-4 py-3 transition-all duration-200 ${
                  errors.amount
                    ? "border-red-300 bg-red-50 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500"
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Tag className="w-4 h-4" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
            >
              {Object.keys(categoryIcons).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Payers Section */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <User className="w-4 h-4" />
              Paid By (Total: ₹{totalPaid})
            </label>
            <div className="flex flex-wrap gap-3 items-center mb-4">
              <select
                value={selectedPayer}
                onChange={(e) => setSelectedPayer(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2"
              >
                <option value="">Select member</option>
                {groupMembers.map((m, i) => {
                  const name = typeof m === "string" ? m : m.username;
                  return (
                    <option key={i} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>

              <input
                type="number"
                placeholder="Amount"
                min="0"
                value={payerAmount}
                onChange={(e) => setPayerAmount(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 w-32"
              />

              <button
                type="button"
                onClick={handleAddPayer}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {payers.length > 0 && (
              <div className="space-y-2">
                {payers.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 border rounded-xl px-4 py-2"
                  >
                    <span>
                      {p.name} — ₹{p.amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePayer(p.name)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.payers && (
              <p className="mt-2 text-sm text-red-600">{errors.payers}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="w-4 h-4" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
            />
          </div>
        </div>

        {/* Participants */}
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Users className="w-5 h-5" />
            Participants ({participants.length})
          </label>

          <div className="flex gap-3 mb-4">
            <input
              list="participantsList"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), handleAddParticipant())
              }
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3"
              placeholder="Add participant..."
            />
            <button
              type="button"
              onClick={handleAddParticipant}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <datalist id="participantsList">
            {groupMembers.map((m, i) => (
              <option key={i} value={typeof m === "string" ? m : m.username} />
            ))}
          </datalist>

          <div className="flex flex-wrap gap-2">
            {participants.map((p, i) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {p.charAt(0).toUpperCase()}
                </div>
                {p}
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(p)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <FileText className="w-4 h-4" />
            Description (Optional)
          </label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 resize-none"
            placeholder="Add any additional details..."
          />
          {errors.payers && (
            <p className="mt-2 text-sm text-red-600">{errors.payers}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            {mode === "edit" && (
              <>
                <button
                  type="button"
                  onClick={handleResetLocal}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white"
            >
              <Save className="w-4 h-4" />
              {mode === "add" ? "Add Expense" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;
