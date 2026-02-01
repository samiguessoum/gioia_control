import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { Table } from '../types';

export default function ServerTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [readyNotice, setReadyNotice] = useState<string | null>(null);
  const prevReadyRef = useRef<Set<number>>(new Set());
  const navigate = useNavigate();
  const socket = useMemo(() => getSocket(), []);

  const loadTables = async () => {
    const res = await api.get('/tables');
    setTables(res.data);
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    const readyTables = new Set(
      tables
        .filter(
          (table) =>
            table.status === 'OCCUPIED' &&
            (table.indicators?.newCount ?? 0) === 0 &&
            (table.indicators?.inProgress ?? 0) === 0 &&
            (table.indicators?.done ?? 0) > 0,
        )
        .map((table) => table.number),
    );
    const prevReady = prevReadyRef.current;
    for (const num of readyTables) {
      if (!prevReady.has(num)) {
        setReadyNotice(`Table ${num} est prete`);
        break;
      }
    }
    prevReadyRef.current = readyTables;
  }, [tables]);

  useEffect(() => {
    const handler = () => loadTables();
    socket.on('table:item_update', handler);
    socket.on('table:order_sent', handler);
    socket.on('table:order_closed', handler);
    return () => {
      socket.off('table:item_update', handler);
      socket.off('table:order_sent', handler);
      socket.off('table:order_closed', handler);
    };
  }, [socket]);

  const openTable = async (table: Table) => {
    const res = await api.post(`/tables/${table.id}/open-order`);
    navigate(`/serveur/table/${table.id}?order=${res.data.id}`);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl">Tables</h2>
          <p className="text-sm text-ink/70">Selectionnez une table pour prendre la commande.</p>
        </div>
        <button className="button-secondary w-full sm:w-auto" onClick={loadTables}>Actualiser</button>
      </div>
      {readyNotice && (
        <div className="card glass p-4 flex items-center justify-between">
          <p className="font-semibold text-basil-700">{readyNotice}</p>
          <button className="button-secondary" onClick={() => setReadyNotice(null)}>OK</button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => openTable(table)}
            className={`card glass p-6 text-left hover:-translate-y-1 transition ${
              table.status === 'OCCUPIED' &&
              (table.indicators?.newCount ?? 0) === 0 &&
              (table.indicators?.inProgress ?? 0) === 0 &&
              (table.indicators?.done ?? 0) > 0
                ? 'ring-2 ring-basil-400'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl">Table {table.number}</h3>
              <span
                className={`status-pill ${table.status === 'FREE' ? 'bg-basil-100 text-basil-700' : 'bg-tomato-100 text-tomato-700'}`}
              >
                {table.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs uppercase text-ink/60">Nouveau</p>
                <p className="text-lg font-semibold">{table.indicators?.newCount ?? 0}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs uppercase text-ink/60">En cours</p>
                <p className="text-lg font-semibold">{table.indicators?.inProgress ?? 0}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs uppercase text-ink/60">Pret</p>
                <p className="text-lg font-semibold">{table.indicators?.done ?? 0}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
