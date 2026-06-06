'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPassword('');

        if (newAttempts >= 3) {
          setError(`Incorrect password. ${newAttempts} failed attempt${newAttempts > 1 ? 's' : ''}. Please double-check your credentials.`);
        } else {
          setError(data.error || 'Incorrect password. Please try again.');
        }
        return;
      }

      // Success — navigate to dashboard
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Connection error. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const isLocked = isLoading;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-slide-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Password field */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-surface-700"
        >
          Admin Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className={`w-4 h-4 transition-colors ${error ? 'text-red-400' : 'text-surface-400'}`} />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
            placeholder="Enter admin password"
            autoComplete="current-password"
            autoFocus
            disabled={isLocked}
            className={`
              w-full pl-10 pr-11 py-3 bg-white rounded-xl border text-surface-900
              placeholder-surface-400 text-sm transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
              disabled:opacity-60 disabled:cursor-not-allowed
              ${error
                ? 'border-red-300 focus:ring-red-400'
                : 'border-surface-200 hover:border-surface-300'
              }
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            disabled={isLocked}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-surface-400 hover:text-surface-600 transition-colors disabled:opacity-40"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword
              ? <EyeOff className="w-4 h-4" />
              : <Eye className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!password.trim() || isLocked}
        className="
          w-full flex items-center justify-center gap-2.5 px-6 py-3
          bg-brand-600 hover:bg-brand-700 active:bg-brand-800
          text-white text-sm font-semibold rounded-xl
          transition-all duration-200 active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          shadow-sm shadow-brand-600/20 hover:shadow-md hover:shadow-brand-600/25
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        "
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            Sign in to Dashboard
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Attempt hint */}
      {attempts > 0 && !isLoading && (
        <p className="text-center text-xs text-surface-400">
          {attempts} failed attempt{attempts > 1 ? 's' : ''} this session
        </p>
      )}
    </form>
  );
}