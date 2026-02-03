import { useEffect, useMemo, useState } from 'react';
import { api, resolveAssetUrl } from '../services/api';
import { getSocket } from '../services/socket';
import { StationQueueItem } from '../types';

export default function StationQueue({ station }: { station: 'kitchen' | 'bar' }) {
  const [items, setItems] = useState<StationQueueItem[]>([]);
  const [recipeItem, setRecipeItem] = useState<StationQueueItem | null>(null);
  const socket = useMemo(() => getSocket(), []);

  const loadQueue = async () => {
    const res = await api.get(`/station/${station}/queue`);
    setItems(res.data);
  };

  useEffect(() => {
    loadQueue();
  }, []);

  useEffect(() => {
    const joinRoom = () => socket.emit('join', { room: `station:${station}` });
    if (!socket.connected) {
      socket.connect();
    }
    joinRoom();
    socket.on('connect', joinRoom);
    const handler = () => loadQueue();
    socket.on('station:new_items', handler);
    socket.on('station:item_update', handler);
    const closeHandler = (payload: { orderId: string; itemIds: string[] }) => {
      setItems((prev) => prev.filter((item) => !payload.itemIds.includes(item.id)));
    };
    socket.on('station:order_closed', closeHandler);
    return () => {
      socket.off('connect', joinRoom);
      socket.off('station:new_items', handler);
      socket.off('station:item_update', handler);
      socket.off('station:order_closed', closeHandler);
    };
  }, [socket, station]);

  const updateStatus = async (id: string, status: 'IN_PROGRESS' | 'DONE') => {
    await api.patch(`/order-items/${id}/status`, { status });
    if (status === 'DONE') {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl">File {station === 'kitchen' ? 'Cuisine' : 'Bar'}</h2>
          <p className="text-sm text-ink/70">Tickets en temps reel.</p>
        </div>
        <button className="button-secondary w-full sm:w-auto" onClick={loadQueue}>Actualiser</button>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card glass p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-basil-700">Table</p>
                <p className="font-display text-2xl">{item.tableNumber}</p>
              </div>
              <span className="status-pill bg-basil-100 text-basil-700">{item.status}</span>
            </div>
            <div className="mt-3">
              <p className="font-semibold">{item.quantity}x {item.nameSnapshot}</p>
              {item.notes && <p className="text-xs text-ink/60 mt-1">{item.notes}</p>}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button className="button-secondary w-full" onClick={() => updateStatus(item.id, 'IN_PROGRESS')}>
                Prendre en charge
              </button>
              <button className="button-primary w-full" onClick={() => updateStatus(item.id, 'DONE')}>
                Termine
              </button>
              {item.recipeText && (
                <button className="button-secondary w-full" onClick={() => setRecipeItem(item)}>
                  Recette
                </button>
              )}
            </div>
          </div>
        ))}
        {!items.length && <p className="text-sm text-ink/60">Aucun ticket pour le moment.</p>}
      </div>
      {recipeItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
          <div className="card glass p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-2xl">{recipeItem.nameSnapshot}</h3>
              <button className="button-secondary" onClick={() => setRecipeItem(null)}>Fermer</button>
            </div>
            {recipeItem.imageUrl && (
              <img
                src={resolveAssetUrl(recipeItem.imageUrl)}
                alt={recipeItem.nameSnapshot}
                className="w-full rounded-2xl mb-4 max-h-64 object-cover"
              />
            )}
            <p className="text-sm text-ink/80 whitespace-pre-line">{recipeItem.recipeText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
