import { useEffect, useState } from 'react';
import { api, resolveAssetUrl } from '../services/api';
import { MenuCategory, MenuItem, User, Table } from '../types';

export default function AdminPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({ name: '', ingredients: '', recipeText: '', imageUrl: '', priceCents: '', categoryId: '', type: 'FOOD' });
  const [uploading, setUploading] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', pin: '', role: 'SERVEUR' });

  const loadAll = async () => {
    const [cats, its, us, ts] = await Promise.all([
      api.get('/admin/menu/categories'),
      api.get('/admin/menu/items'),
      api.get('/admin/users'),
      api.get('/admin/tables'),
    ]);
    setCategories(cats.data);
    setItems(its.data);
    setUsers(us.data);
    setTables(ts.data);
    if (!newItem.categoryId && cats.data[0]) {
      setNewItem((prev) => ({ ...prev, categoryId: cats.data[0].id }));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createCategory = async () => {
    await api.post('/admin/menu/categories', { name: newCategory, sortOrder: categories.length + 1 });
    setNewCategory('');
    await loadAll();
  };

  const createItem = async () => {
    await api.post('/admin/menu/items', {
      name: newItem.name,
      ingredients: newItem.ingredients || undefined,
      recipeText: newItem.recipeText || undefined,
      imageUrl: newItem.imageUrl || undefined,
      priceCents: Number(newItem.priceCents),
      categoryId: newItem.categoryId,
      type: newItem.type,
      isAvailable: true,
    });
    setNewItem({ name: '', ingredients: '', recipeText: '', imageUrl: '', priceCents: '', categoryId: newItem.categoryId, type: newItem.type });
    await loadAll();
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/admin/menu/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setNewItem((prev) => ({ ...prev, imageUrl: res.data.url }));
      }
    } finally {
      setUploading(false);
    }
  };

  const createUser = async () => {
    await api.post('/admin/users', {
      name: newUser.name,
      email: newUser.email || undefined,
      password: newUser.password || undefined,
      pin: newUser.pin || undefined,
      role: newUser.role,
    });
    setNewUser({ name: '', email: '', password: '', pin: '', role: 'SERVEUR' });
    await loadAll();
  };

  const toggleItem = async (item: MenuItem) => {
    await api.patch(`/admin/menu/items/${item.id}`, { isAvailable: !item.isAvailable });
    await loadAll();
  };

  const toggleUser = async (user: User) => {
    await api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive });
    await loadAll();
  };

  const initTables = async () => {
    await api.post('/admin/tables/init?count=15');
    await loadAll();
  };

  const addTable = async () => {
    if (!newTableNumber) return;
    await api.post('/admin/tables', { number: Number(newTableNumber) });
    setNewTableNumber('');
    await loadAll();
  };

  const deleteTable = async (id: string) => {
    await api.delete(`/admin/tables/${id}`);
    await loadAll();
  };

  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card glass p-6">
          <h2 className="font-display text-2xl mb-4">Categories</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              className="flex-1 rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Nouvelle categorie"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button className="button-primary w-full sm:w-auto" onClick={createCategory}>Ajouter</button>
          </div>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white/70 rounded-2xl p-3 flex items-center justify-between">
                <span>{cat.name}</span>
                <span className={`status-pill ${cat.isActive ? 'bg-basil-100 text-basil-700' : 'bg-tomato-100 text-tomato-700'}`}>
                  {cat.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card glass p-6">
          <h2 className="font-display text-2xl mb-4">Produits</h2>
          <div className="grid gap-3 mb-4">
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Nom"
              value={newItem.name}
              onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Ingredients (ex: tomate, mozzarella, basilic)"
              value={newItem.ingredients}
              onChange={(e) => setNewItem((prev) => ({ ...prev, ingredients: e.target.value }))}
            />
            <textarea
              className="rounded-2xl border border-basil-200 px-4 py-2 min-h-[100px]"
              placeholder="Recette (ex: 2 cups sirop, 20cl citron...)"
              value={newItem.recipeText}
              onChange={(e) => setNewItem((prev) => ({ ...prev, recipeText: e.target.value }))}
            />
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="URL image (optionnel)"
              value={newItem.imageUrl}
              onChange={(e) => setNewItem((prev) => ({ ...prev, imageUrl: e.target.value }))}
            />
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  uploadImage(file);
                }
              }}
            />
            {uploading && <p className="text-xs text-ink/60">Upload en cours...</p>}
            {newItem.imageUrl && (
              <img
                src={resolveAssetUrl(newItem.imageUrl)}
                alt="Apercu"
                className="w-full rounded-2xl max-h-48 object-cover"
              />
            )}
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Prix en DZD (ex: 2500)"
              type="number"
              value={newItem.priceCents}
              onChange={(e) => setNewItem((prev) => ({ ...prev, priceCents: e.target.value }))}
            />
            <select
              className="rounded-2xl border border-basil-200 px-4 py-2"
              value={newItem.categoryId}
              onChange={(e) => setNewItem((prev) => ({ ...prev, categoryId: e.target.value }))}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-basil-200 px-4 py-2"
              value={newItem.type}
              onChange={(e) => setNewItem((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="FOOD">FOOD</option>
              <option value="DRINK">DRINK</option>
            </select>
            <button className="button-primary" onClick={createItem}>Ajouter</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {items.map((item) => (
              <div key={item.id} className="bg-white/70 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-ink/60">{item.type} - {item.priceCents} DZD</p>
                  {item.ingredients && <p className="text-xs text-ink/50 mt-1">{item.ingredients}</p>}
                  {item.recipeText && <p className="text-xs text-ink/50 mt-1">Recette: {item.recipeText}</p>}
                </div>
                <button className="button-secondary" onClick={() => toggleItem(item)}>
                  {item.isAvailable ? 'Desactiver' : 'Activer'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card glass p-6">
          <h2 className="font-display text-2xl mb-4">Utilisateurs</h2>
          <div className="grid gap-3 mb-4">
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Nom"
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Email (optionnel)"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Mot de passe"
              value={newUser.password}
              onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
            />
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="PIN"
              value={newUser.pin}
              onChange={(e) => setNewUser((prev) => ({ ...prev, pin: e.target.value }))}
            />
            <select
              className="rounded-2xl border border-basil-200 px-4 py-2"
              value={newUser.role}
              onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SERVEUR">SERVEUR</option>
              <option value="CUISINE">CUISINE</option>
              <option value="BAR">BAR</option>
            </select>
            <button className="button-primary w-full" onClick={createUser}>Ajouter</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {users.map((user) => (
              <div key={user.id} className="bg-white/70 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-ink/60">{user.role}</p>
                </div>
                <button className="button-secondary" onClick={() => toggleUser(user)}>
                  {user.isActive ? 'Desactiver' : 'Activer'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card glass p-6">
          <h2 className="font-display text-2xl mb-4">Tables</h2>
          <button className="button-primary mb-4 w-full sm:w-auto" onClick={initTables}>Initialiser 15 tables</button>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Numero de table"
              type="number"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
            />
            <button className="button-primary w-full sm:w-auto" onClick={addTable}>Ajouter</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tables.map((table) => (
              <div key={table.id} className="bg-white/70 rounded-2xl p-3 text-center">
                <p className="font-semibold">#{table.number}</p>
                <p className="text-xs text-ink/60">{table.status}</p>
                <button className="button-secondary mt-2 w-full" onClick={() => deleteTable(table.id)}>Supprimer</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
