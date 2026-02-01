import { FormEvent, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';

export default function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<'email' | 'pin'>('pin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = mode === 'email' ? { email, password } : { name, pin };
      const res = await api.post('/auth/login', payload);
      localStorage.setItem('accessToken', res.data.accessToken);
      onLogin(res.data.user);
    } catch (err: any) {
      setError('Connexion impossible');
    }
  };

  return (
    <div className="min-h-screen app-shell flex items-center justify-center px-6">
      <div className="max-w-md w-full card glass p-8">
        <h1 className="font-display text-3xl mb-2">Gioia</h1>
        <p className="text-sm text-ink/70 mb-6">Connexion rapide pour la salle et les stations.</p>
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            className={mode === 'pin' ? 'button-primary flex-1' : 'button-secondary flex-1'}
            onClick={() => setMode('pin')}
          >
            Nom + PIN
          </button>
          <button
            type="button"
            className={mode === 'email' ? 'button-primary flex-1' : 'button-secondary flex-1'}
            onClick={() => setMode('email')}
          >
            Email
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'email' ? (
            <>
              <input
                className="w-full rounded-2xl border border-basil-200 px-4 py-3"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-basil-200 px-4 py-3"
                placeholder="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          ) : (
            <>
              <input
                className="w-full rounded-2xl border border-basil-200 px-4 py-3"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-basil-200 px-4 py-3"
                placeholder="PIN"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </>
          )}
          {error && <p className="text-sm text-tomato-600">{error}</p>}
          <button type="submit" className="button-primary w-full">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
