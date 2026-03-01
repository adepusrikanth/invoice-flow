import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-lg font-bold text-brand-primary">InvoiceFlow</Link>
        <h1 className="text-2xl font-bold text-neutral-900 mt-8 mb-6">Forgot password</h1>
        <p className="text-neutral-600 mb-4">Enter your email and we’ll send you a reset link.</p>
        <form className="space-y-4">
          <input type="email" placeholder="you@example.com" className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary" />
          <button type="submit" className="w-full py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90">Send reset link</button>
        </form>
        <p className="mt-6 text-center text-neutral-500 text-sm">
          <Link href="/login" className="text-brand-primary hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
