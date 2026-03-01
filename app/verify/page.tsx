import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-lg font-bold text-brand-primary">InvoiceFlow</Link>
        <h1 className="text-2xl font-bold text-neutral-900 mt-8 mb-6">Verify your email</h1>
        <p className="text-neutral-600 mb-4">Enter the 6-digit code we sent to your email.</p>
        <input type="text" maxLength={6} placeholder="000000" className="w-full px-4 py-3 rounded-input border border-neutral-300 bg-white text-neutral-900 text-center text-xl font-mono placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary" />
        <button type="button" className="w-full py-2.5 rounded-button bg-brand-primary text-white font-medium mt-4 hover:bg-brand-primary/90">Verify</button>
        <p className="mt-6 text-neutral-500 text-sm"><Link href="/login" className="text-brand-primary hover:underline">Back to sign in</Link></p>
      </div>
    </div>
  );
}
