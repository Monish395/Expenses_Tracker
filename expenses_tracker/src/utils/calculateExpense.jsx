// Utility to calculate splits, netBalances, and settlements
// If customSplits is provided, use it; otherwise, compute equal splits
export const calculateExpense = (expense, customSplits = null) => {
  const total = parseFloat(expense.amount) || 0;
  const participants = expense.participants || [];
  const payers = expense.payers || [];

  // 1️⃣ Determine splits
  let splits = {};
  if (customSplits) {
    splits = { ...customSplits }; // use custom splits as-is
  } else {
    // equal split
    const rawShare = participants.length ? total / participants.length : 0;
    participants.forEach((p) => (splits[p] = +rawShare.toFixed(2)));

    // adjust rounding errors
    const allocated = Object.values(splits).reduce((s, v) => s + v, 0);
    let diff = +(total - allocated).toFixed(2);
    let i = 0;
    while (Math.abs(diff) >= 0.01 && participants.length > 0) {
      const name = participants[i % participants.length];
      const adjustment = diff > 0 ? 0.01 : -0.01;
      splits[name] = +(splits[name] + adjustment).toFixed(2);
      diff -= adjustment;
      i++;
    }
  }

  // 2️⃣ Compute netBalances
  const netBalances = {};
  const allUsers = Array.from(
    new Set([...participants, ...payers.map((p) => p.name)])
  );
  allUsers.forEach((u) => {
    const paid = payers.find((p) => p.name === u)?.amount || 0;
    const owed = splits[u] || 0;
    netBalances[u] = +(paid - owed).toFixed(2);
  });

  // 3️⃣ Compute settlements
  const settlements = [];
  const debtors = Object.entries(netBalances)
    .filter(([_, bal]) => bal < -0.01)
    .map(([name, bal]) => ({ name, bal: -bal }));
  const creditors = Object.entries(netBalances)
    .filter(([_, bal]) => bal > 0.01)
    .map(([name, bal]) => ({ name, bal }));

  let di = 0,
    ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(debtor.bal, creditor.bal);
    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: +amount.toFixed(2),
    });
    debtor.bal -= amount;
    creditor.bal -= amount;
    if (debtor.bal <= 0.01) di++;
    if (creditor.bal <= 0.01) ci++;
  }

  return { splits, netBalances, settlements };
};
