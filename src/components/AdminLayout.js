'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, LayoutDashboard, MessageCircle } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-surface-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-surface-900 text-sm leading-none block">Admin Panel</span>
                <span className="text-xs text-surface-400 leading-none block">NACOS OAU Feedback</span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-1 bg-surface-100 rounded-xl p-1">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-white rounded-lg shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-800 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              View public site
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-surface-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
          <footer className="border-t border-surface-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900">
                  NACOS OAU Chapter
                </p>
                <p className="text-xs text-surface-400">
                  Anonymous Feedback Platform
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-surface-400">
              <span>
                Powered by{" "}
                <Link
                  href="https://modred.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-600"
                >
                  Modred
                </Link>
              </span>{" "}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}