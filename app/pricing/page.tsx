import Link from 'next/link';

export default function PricingPage() {
  const tiers = [
    { name: 'Free', price: 0, invoices: 5, clients: 3, team: 1, ai: '20 queries/mo' },
    { name: 'Starter', price: 9, invoices: 100, clients: 50, team: 2, ai: '200 queries/mo' },
    { name: 'Pro', price: 29, invoices: 'Unlimited', clients: 'Unlimited', team: 5, ai: '1,000 queries/mo', popular: true },
    { name: 'Business', price: 79, invoices: 'Unlimited', clients: 'Unlimited', team: 15, ai: '5,000 queries/mo' },
    { name: 'Enterprise', price: 'Contact', invoices: 'Unlimited', clients: 'Unlimited', team: 'Unlimited', ai: 'Unlimited' },
  ];
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-center">
        <Link href="/" className="text-xl font-bold text-neutral-900">InvoiceFlow</Link>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 text-center mb-4">Pricing</h1>
        <p className="text-neutral-600 text-center mb-12">Monthly and annual billing. Annual saves 20%.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {tiers.map((t) => (
            <div key={t.name} className={`rounded-card bg-white border p-6 ${t.popular ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-neutral-200'}`}>
              {t.popular && <span className="text-xs font-medium text-brand-primary">Popular</span>}
              <h2 className="font-semibold text-neutral-900 mt-2">{t.name}</h2>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{typeof t.price === 'number' ? `$${t.price}` : t.price}<span className="text-sm font-normal text-neutral-500">/mo</span></p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                <li>{t.invoices} invoices</li>
                <li>{t.clients} clients</li>
                <li>{t.team} team</li>
                <li>{t.ai} AI</li>
              </ul>
              <Link href="/register" className="mt-4 block w-full py-2 rounded-button text-center text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary/90">Get started</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
