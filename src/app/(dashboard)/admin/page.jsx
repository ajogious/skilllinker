import { requireRole } from "@/lib/session";

export default async function AdminDashboard() {
  const session = await requireRole("ADMIN");

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Panel 🛡️</h1>
        <p className="text-slate-400">Admin Dashboard — Coming up next!</p>
      </div>
    </div>
  );
}
