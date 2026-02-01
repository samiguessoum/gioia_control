import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { MenuCategory, MenuItem, Order, OrderItem } from '../types';

export default function ServerOrderPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(searchParams.get('order'));
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [readyNotice, setReadyNotice] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const socket = useMemo(() => getSocket(), []);

  const loadOrder = async (id: string) => {
    const orderRes = await api.get(`/orders/${id}`);
    setOrder(orderRes.data);
  };

  useEffect(() => {
    const init = async () => {
      if (!tableId) return;
      if (orderId) {
        await loadOrder(orderId);
        return;
      }
      const res = await api.post(`/tables/${tableId}/open-order`);
      setOrderId(res.data.id);
      await loadOrder(res.data.id);
    };
    init();
  }, [tableId, orderId]);

  useEffect(() => {
    const onFocus = () => {
      if (orderId) {
        loadOrder(orderId);
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [orderId]);

  useEffect(() => {
    const loadMenu = async () => {
      const [itemsRes, catRes] = await Promise.all([api.get('/menu/items'), api.get('/menu/categories')]);
      setMenuItems(itemsRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) {
        setActiveCategory(catRes.data[0].id);
      }
    };
    loadMenu();
  }, []);

  useEffect(() => {
    if (!tableId) return;
    const joinRoom = () => socket.emit('join', { room: `table:${tableId}` });
    if (!socket.connected) {
      socket.connect();
    }
    joinRoom();
    socket.on('connect', joinRoom);
    const handler = (payload: { item: OrderItem }) => {
      setOrder((prev) => {
        if (!prev) return prev;
        const items = prev.items.map((item) => (item.id === payload.item.id ? payload.item : item));
        return { ...prev, items };
      });
    };
    socket.on('table:item_update', handler);
    return () => {
      socket.off('connect', joinRoom);
      socket.off('table:item_update', handler);
    };
  }, [socket, tableId]);

  useEffect(() => {
    if (!order?.items?.length) {
      setReadyNotice(false);
      return;
    }
    const allDone = order.items.every((item) => item.status === 'DONE');
    setReadyNotice(allDone);
  }, [order]);

  const addItem = async (item: MenuItem) => {
    if (!orderId) return;
    const res = await api.post(`/orders/${orderId}/items`, {
      menuItemId: item.id,
      quantity: 1,
      notes: notes[item.id] || undefined,
    });
    setOrder((prev) => (prev ? { ...prev, items: [...prev.items, res.data] } : prev));
  };

  const sendOrder = async () => {
    if (!orderId) return;
    const res = await api.post(`/orders/${orderId}/send`);
    setOrder(res.data);
    setSentNotice(true);
  };

  const closeOrder = async () => {
    if (!orderId) return;
    await api.post(`/orders/${orderId}/close`);
    navigate('/serveur');
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory ? item.categoryId === activeCategory : true;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-basil-700">Table</p>
          <h2 className="font-display text-3xl">{order?.table?.number ?? tableId}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          <button className="button-secondary w-full" onClick={() => navigate('/serveur')}>Retour</button>
          <button className="button-primary w-full" onClick={sendOrder}>Envoyer</button>
          <button className="button-secondary w-full" onClick={closeOrder}>Cloturer</button>
        </div>
      </div>
      {readyNotice && (
        <div className="card glass p-4">
          <p className="font-semibold text-basil-700">Commande prete a servir</p>
        </div>
      )}
      {sentNotice && (
        <div className="card glass p-4 flex items-center justify-between">
          <p className="font-semibold text-basil-700">Commande envoyée</p>
          <button className="button-secondary" onClick={() => setSentNotice(false)}>OK</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid gap-6">
          <div className="card glass p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={
                    activeCategory === category.id
                      ? 'button-primary px-4 py-2'
                      : 'button-secondary px-4 py-2'
                  }
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <input
              className="w-full rounded-2xl border border-basil-200 px-4 py-3 mb-4"
              placeholder="Recherche rapide"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white/70 rounded-2xl p-4 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-ink/60">{item.description}</p>
                      {item.ingredients && (
                        <p className="text-xs text-ink/50 mt-1">{item.ingredients}</p>
                      )}
                    </div>
                    <span className="font-semibold">{item.priceCents} DZD</span>
                  </div>
                  <textarea
                    className="mt-3 w-full rounded-xl border border-basil-100 px-3 py-2 text-sm"
                    placeholder="Notes"
                    value={notes[item.id] || ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  />
                  <button className="button-primary mt-3" onClick={() => addItem(item)}>
                    Ajouter
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card glass p-6">
          <h3 className="font-display text-2xl mb-4">Commande</h3>
          <div className="space-y-3">
            {order?.items.map((item) => (
              <div key={item.id} className="bg-white/70 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {item.quantity}x {item.nameSnapshot}
                  </p>
                  <span className="status-pill bg-basil-100 text-basil-700">{item.status}</span>
                </div>
                {item.notes && <p className="text-xs text-ink/60 mt-1">{item.notes}</p>}
              </div>
            ))}
            {!order?.items.length && <p className="text-sm text-ink/60">Aucun item pour le moment.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
