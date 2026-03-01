import { redirect } from 'next/navigation';
import Link from 'next/link';
import RegisterForm from './RegisterForm';

export default async function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-lg font-bold text-brand-primary">InvoiceFlow</Link>
        <h1 className="text-2xl font-bold text-neutral-900 mt-8 mb-6">Create account</h1>
        <RegisterForm />
        <p className="mt-6 text-center text-neutral-500 text-sm">
          Already have an account? <Link href="/login" className="text-brand-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
