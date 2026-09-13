import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 text-2xl font-black">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
        Page Introuvable
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
