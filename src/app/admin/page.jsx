import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { Shield } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login - Nacos OAU Feedback",
};

export default async function AdminLoginPage() {
  const authed = await isAuthenticated();
  if (authed) redirect("/admin/dashboard");

  return (
    <div className="min-h-screen pattern-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-surface-900">
            Admin Access
          </h1>
          <p className="text-surface-500 mt-1 text-sm">
            Nacos OAU Chapter — Feedback Platform
          </p>{" "}
        </div>
        {/* Login form card */}
        <div className="card p-8">
          <AdminLoginForm />
        </div>
        <p className="text-center mt-6 text-xs text-surface-400">
          Powered by{" "}
          <Link
            href="https://modred.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-600"
          >
            Modred
          </Link>
        </p>
      </div>
    </div>
  );
  
}
