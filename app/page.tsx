import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LandingInvoiceTemplates } from '@/components/landing/LandingInvoiceTemplates';

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect('/dashboard');
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50">
      <header className="sticky top-0 z-10 h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-neutral-900 tracking-tight">InvoiceFlow</Link>
          <nav className="flex items-center gap-6">
            <Link href="/#templates" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Templates</Link>
            <Link href="/#features" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Features</Link>
            <Link href="/pricing" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Pricing</Link>
            <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900 transition">Login</Link>
            <Link href="/register" className="px-4 py-2.5 rounded-button bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/25 transition hover:shadow-xl">Start Free</Link>
          </nav>
        </div>
      </header>

      <LandingInvoiceTemplates />

      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-5 opacity-0 animate-fade-in-up delay-200">Create Invoices in Seconds with AI</h1>
        <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto opacity-0 animate-fade-in-up delay-300">AI-powered invoicing and billing. Smart reminders, multi-currency, client portal, and tax reports — all in one place.</p>
        <div className="opacity-0 animate-fade-in-up delay-400">
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-button bg-brand-primary text-white text-lg font-medium hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/25 transition hover:scale-105">Start Free →</Link>
        </div>
      </section>
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12 opacity-0 animate-fade-in">Everything you need to get paid</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {['AI Invoice Generator', 'Smart Reminders', 'Multi-Currency', 'Client Portal', 'Expense Tracking', 'Tax Reports'].map((title, i) => (
            <div key={title} className="rounded-xl bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300 opacity-0 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <h3 className="font-semibold text-neutral-900">{title}</h3>
              <p className="text-sm text-neutral-500 mt-2">Feature description placeholder.</p>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">Simple pricing</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Free', price: '$0', desc: '5 invoices/month' },
            { name: 'Starter', price: '$9', desc: '100 invoices' },
            { name: 'Pro', price: '$29', desc: 'Unlimited', popular: true },
            { name: 'Business', price: '$79', desc: 'Team + API' },
          ].map((tier, i) => (
            <div key={tier.name} className={`rounded-xl bg-white border p-6 shadow-sm hover:shadow-lg transition-all duration-300 opacity-0 animate-fade-in-up ${tier.popular ? 'border-brand-primary ring-2 ring-brand-primary/20 scale-105' : 'border-neutral-200'}`} style={{ animationDelay: `${i * 80}ms` }}>
              {tier.popular && <span className="text-xs font-medium text-brand-primary">Popular</span>}
              <h3 className="font-semibold text-neutral-900 mt-2">{tier.name}</h3>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{tier.price}<span className="text-sm font-normal text-neutral-500">/mo</span></p>
              <p className="text-sm text-neutral-500 mt-2">{tier.desc}</p>
              <Link href="/register" className="mt-4 block w-full py-2.5 rounded-button text-center text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary/90 transition">Get started</Link>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-neutral-200 mt-20 py-12 bg-neutral-50/50">
        <div className="max-w-6xl mx-auto px-4 text-center text-neutral-500 text-sm">
          <p>InvoiceFlow — AI-Powered Invoice & Billing Platform</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/login" className="hover:text-neutral-900">Login</Link>
            <Link href="/register" className="hover:text-neutral-900">Sign up</Link>
            <Link href="/pricing" className="hover:text-neutral-900">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
