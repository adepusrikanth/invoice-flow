import Link from 'next/link';

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/expenses" className="text-neutral-500 hover:text-neutral-900 text-sm">← Expenses</Link>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900">Add Expense</h1>
      <div className="rounded-card bg-white border border-neutral-200 p-6 shadow-sm max-w-xl">
        <p className="text-neutral-500">Expense form (date, category, amount, receipt upload).</p>
      </div>
    </div>
  );
}
