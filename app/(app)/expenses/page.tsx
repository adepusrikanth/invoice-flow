import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ExpensesPage() {
  const session = await getSession();
  if (!session) return null;
  const expenses = await prisma.expense.findMany({
    where: { userId: session.id },
    orderBy: { date: 'desc' },
  });
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Expenses</h1>
        <Link href="/expenses/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90">
          <Plus className="w-4 h-4" /> Add Expense
        </Link>
      </div>
      <div className="rounded-card bg-white border border-neutral-200 p-4 shadow-sm">
        <p className="text-sm text-neutral-500">Total expenses</p>
        <p className="text-2xl font-bold text-neutral-900 font-mono">${total.toFixed(2)}</p>
      </div>
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Description</th>
              <th className="p-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-neutral-100">
                <td className="p-3 text-neutral-600">{e.date}</td>
                <td className="p-3 text-neutral-600">{e.category}</td>
                <td className="p-3 text-neutral-900">{e.description}</td>
                <td className="p-3 text-right font-mono">{e.currency} {e.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && <div className="p-8 text-center text-neutral-500">No expenses yet.</div>}
      </div>
    </div>
  );
}
