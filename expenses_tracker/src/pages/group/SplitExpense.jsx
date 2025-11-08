import { useState, useEffect, useMemo, useCallback } from "react";
import { Calculator, Users, DollarSign, AlertCircle } from "lucide-react";
import { calculateExpense } from "../../utils/CalculateExpense";

function SplitExpense({ selectedExpense, onSave, onCancel }) {
  if (!selectedExpense) return null;

  const participants = useMemo(
    () =>
      (selectedExpense.participants || []).map((p) =>
        typeof p === "string" ? p : p.username ?? String(p)
      ),
    [selectedExpense.participants]
  );

  const total = useMemo(
    () => parseFloat(selectedExpense.amount) || 0,
    [selectedExpense.amount]
  );

  const [mode, setMode] = useState("equal");
  const [splits, setSplits] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize splits whenever selectedExpense or mode changes
  useEffect(() => {
    const initialSplits = selectedExpense.splits
      ? { ...selectedExpense.splits }
      : {};
    if (mode === "equal" && participants.length > 0) {
      const share = +(total / participants.length).toFixed(2);
      participants.forEach((p) => (initialSplits[p] = share));
    }
    setSplits(initialSplits);
    setErrors({});
  }, [selectedExpense, participants.join(","), mode, total]);

  const { allocated, remaining } = useMemo(() => {
    const allocatedSum = Object.values(splits).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );
    return {
      allocated: +allocatedSum.toFixed(2),
      remaining: +(total - allocatedSum).toFixed(2),
    };
  }, [splits, total]);

  const handleChange = useCallback((participant, value) => {
    const num = parseFloat(value);
    setSplits((prev) => ({ ...prev, [participant]: isNaN(num) ? 0 : num }));
  }, []);

  const handleSave = useCallback(() => {
    if (mode === "custom" && Math.abs(remaining) > 0.01) {
      setErrors({
        general: `Total must equal ₹${total.toFixed(
          2
        )}, but current total is ₹${allocated.toFixed(2)}`,
      });
      return;
    }

    if (Object.values(splits).some((v) => parseFloat(v) < 0)) {
      setErrors({ general: "All amounts must be positive" });
      return;
    }

    // Calculate using helper with explicit splits
    const { netBalances, settlements } = calculateExpense({
      ...selectedExpense,
      splits,
    });

    const updatedExpense = {
      ...selectedExpense,
      splits,
      netBalances,
      settlements,
    };

    onSave?.(updatedExpense); // Parent will PATCH & refresh
  }, [mode, splits, remaining, allocated, selectedExpense, onSave, total]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Split Expense</h2>
        </div>
        <h3 className="text-xl font-semibold opacity-90">
          {selectedExpense.title}
        </h3>
        {selectedExpense.description && (
          <p className="text-blue-100">{selectedExpense.description}</p>
        )}
      </div>

      {/* Body */}
      <div className="px-8 py-6 space-y-6">
        {/* Total */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-700">Total Amount</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">
              ₹{total.toFixed(2)}
            </span>
          </div>

          {mode === "custom" && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-500">Allocated</p>
                <p className="font-semibold text-blue-600">
                  ₹{allocated.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Remaining</p>
                <p
                  className={`font-semibold ${
                    remaining === 0
                      ? "text-green-600"
                      : remaining > 0
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{remaining.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Participants</p>
                <p className="font-semibold text-gray-700">
                  {participants.length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mode Buttons */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Split Method
          </label>
          <div className="flex gap-3">
            {["equal", "custom"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMode(type)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 ${
                  mode === type
                    ? type === "equal"
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                {type === "equal" ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                <span className="font-medium capitalize">{type} Split</span>
              </button>
            ))}
          </div>
        </div>

        {/* Participant Inputs */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Participant Shares
          </label>
          <div className="space-y-3">
            {participants.map((p) => (
              <div
                key={p}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {p.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-900">{p}</p>
                  {mode === "equal" && (
                    <p className="text-xs text-gray-500">Equal share</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={splits[p] ?? ""}
                    onChange={(e) => handleChange(p, e.target.value)}
                    readOnly={mode === "equal"}
                    className={`w-24 px-3 py-2 text-right font-semibold rounded-lg border ${
                      mode === "equal"
                        ? "bg-gray-100 border-gray-200"
                        : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Errors */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={
              !!errors.general ||
              (mode === "custom" && Math.abs(remaining) > 0.01)
            }
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white"
          >
            Save Split
          </button>
        </div>
      </div>
    </div>
  );
}

export default SplitExpense;
