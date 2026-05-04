import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">English Learning Platform</h1>
        
        <div className="flex justify-center space-x-6 mt-10">
          <Link href="/quiz" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Start Quiz
          </Link>
          <Link href="/admin" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg shadow hover:bg-slate-300 transition">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
