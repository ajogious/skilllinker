import { requireRole } from "@/lib/session";

export default async function TradesmanDashboard() {
  const session = await requireRole("TRADESMAN");

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, {session.user.name} 🔧
        </h1>
        <p className="text-slate-400">Tradesman Dashboard — Coming up next!</p>
      </div>
    </div>
  );
}
