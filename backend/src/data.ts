export const transactions = [
  { id: 1, date: "2025-02-01", description: "Groceries", category: "Food", amount: -1200 },
  { id: 2, date: "2025-02-02", description: "Salary", category: "Income", amount: 50000 },
  { id: 3, date: "2025-02-03", description: "Uber", category: "Transport", amount: -300 },
  { id: 4, date: "2025-02-04", description: "Coffee", category: "Food", amount: -150 },
  { id: 5, date: "2025-02-05", description: "Rent", category: "Housing", amount: -20000 }
];

export const budgets = [
  { id: 1, category: "Food", limit: 8000 },
  { id: 2, category: "Transport", limit: 3000 },
  { id: 3, category: "Housing", limit: 20000 }
];

export function getSummary() {
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const net = income + expenses;
  return { income, expenses, net };
}
