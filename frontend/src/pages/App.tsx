import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { User } from '../types';
import LoginPage from './LoginPage';
import ServerTablesPage from './ServerTablesPage';
import ServerOrderPage from './ServerOrderPage';
import KitchenPage from './KitchenPage';
import BarPage from './BarPage';
import AdminPage from './AdminPage';
import AppShell from '../components/AppShell';

const STORAGE_KEY = 'gioia.user';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    if (user) {
      socket.connect();
    } else {
      socket.disconnect();
    }
  }, [user, socket]);

  const handleLogout = async () => {
    const userId = user?.id;
    setUser(null);
    localStorage.removeItem('accessToken');
    if (userId) {
      await api.post('/auth/logout', { userId });
    }
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppShell user={user} onLogout={handleLogout}>
      <Routes>
        {user.role === 'SERVEUR' && (
          <>
            <Route path="/" element={<Navigate to="/serveur" replace />} />
            <Route path="/serveur" element={<ServerTablesPage />} />
            <Route path="/serveur/table/:tableId" element={<ServerOrderPage />} />
          </>
        )}
        {user.role === 'CUISINE' && (
          <>
            <Route path="/" element={<Navigate to="/cuisine" replace />} />
            <Route path="/cuisine" element={<KitchenPage />} />
          </>
        )}
        {user.role === 'BAR' && (
          <>
            <Route path="/" element={<Navigate to="/bar" replace />} />
            <Route path="/bar" element={<BarPage />} />
          </>
        )}
        {user.role === 'ADMIN' && (
          <>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminPage />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
