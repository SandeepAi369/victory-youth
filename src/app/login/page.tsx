import { Lock } from "lucide-react";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const error = sp?.error;
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-stone-900 dark:text-white">Victory Youth</h1>
          <p className="text-stone-500 text-center mt-1 text-sm">Admin Panel Access</p>
        </div>

        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              name="password"
              placeholder="Enter admin password"
              autoFocus
              className="flex h-12 w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent px-4 py-2 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200">
                <span>⚠️</span> <span>{error}</span>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            Login →
          </button>
        </form>
      </div>
    </div>
  );
}
