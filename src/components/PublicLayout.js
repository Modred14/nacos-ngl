import Link from "next/link";
import { MessageCircle, Shield } from "lucide-react";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col grain-overlay">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-surface-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition-colors">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-surface-900 text-sm leading-none block">
                NACOS OAU
              </span>
              <span className="text-xs text-surface-400 leading-none block">
                Feedback
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
            <Shield className="w-3 h-3" />
            <span>100% Anonymous</span>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-surface-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
