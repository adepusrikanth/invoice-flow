import Link from 'next/link';

type Invoice = {
  id: string;
  filename: string;
  status: string;
  vendorName: string | null;
  amount: number | null;
  currency: string | null;
  dueDate: string | null;
  createdAt: Date;
};

export function InvoiceList({ initialInvoices }: { initialInvoices: Invoice[] }) {
  if (initialInvoices.length === 0) {
    return (
      <div className="rounded-xl bg-slate-900/50 border border-slate-700 p-8 text-center text-slate-500">
        No invoices yet. Paste text or upload a file above to extract data with AI.
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-lg font-medium text-white mb-4">Recent invoices</h2>
      <ul className="space-y-2">
        {initialInvoices.map((inv) => (
          <li key={inv.id}>
            <Link
              href={`/dashboard/invoices/${inv.id}`}
              className="block rounded-lg bg-slate-900/80 border border-slate-700 p-4 hover:border-slate-600 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-white">{inv.vendorName || inv.filename}</p>
                  <p className="text-sm text-slate-500">{inv.filename}</p>
                </div>
                <div className="text-right">
                  {inv.amount != null && (
                    <p className="font-medium text-white">
                      {inv.currency || ''} {inv.amount.toFixed(2)}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
