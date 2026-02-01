import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

export default function AppShell({ user, onLogout, children }: { user: User; onLogout: () => void; children: ReactNode }) {
  return (
    <div className="min-h-screen app-shell">
      <header className="px-4 sm:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="group">
          <p className="text-xs uppercase tracking-[0.25em] text-basil-700 group-hover:text-basil-600">Gioia</p>
          <h1 className="font-display text-2xl group-hover:text-basil-700">{user.role}</h1>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="text-left sm:text-right">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-basil-700">Connecte</p>
          </div>
          <button className="button-secondary" onClick={onLogout}>
            Deconnexion
          </button>
        </div>
      </header>
      <main className="px-4 sm:px-6 pb-10">{children}</main>
    </div>
  );
}
