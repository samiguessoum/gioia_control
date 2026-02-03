import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MenuCategory, MenuItem, User, Table } from '../types';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({ name: '', ingredients: '', recipeText: '', priceCents: '', categoryId: '', type: 'FOOD' });
    const [newTableNumber, setNewTableNumber] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', pin: '', role: 'SERVEUR' });

  // Modal de confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

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

  const toggleCategory = async (cat: MenuCategory) => {
    await api.patch(`/admin/menu/categories/${cat.id}`, { isActive: !cat.isActive });
    await loadAll();
  };

  const deleteCategory = (cat: MenuCategory) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer la categorie',
      message: `Voulez-vous vraiment supprimer "${cat.name}" ? Tous les produits de cette categorie seront aussi supprimes.`,
      onConfirm: async () => {
        await api.delete(`/admin/menu/categories/${cat.id}`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await loadAll();
      },
    });
  };

  const createItem = async () => {
    await api.post('/admin/menu/items', {
      name: newItem.name,
      ingredients: newItem.ingredients || undefined,
      recipeText: newItem.recipeText || undefined,
      priceCents: Number(newItem.priceCents),
      categoryId: newItem.categoryId,
      type: newItem.type,
      isAvailable: true,
    });
    setNewItem({ name: '', ingredients: '', recipeText: '', priceCents: '', categoryId: newItem.categoryId, type: newItem.type });
    await loadAll();
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

  const deleteItem = (item: MenuItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer le produit',
      message: `Voulez-vous vraiment supprimer "${item.name}" ? Cette action est irreversible.`,
      onConfirm: async () => {
        await api.delete(`/admin/menu/items/${item.id}`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await loadAll();
      },
    });
  };

  const toggleUser = async (user: User) => {
    await api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive });
    await loadAll();
  };

  const deleteUser = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer l\'utilisateur',
      message: `Voulez-vous vraiment supprimer "${user.name}" ? Cette action est irreversible.`,
      onConfirm: async () => {
        await api.delete(`/admin/users/${user.id}`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await loadAll();
      },
    });
  };

  const addTable = async () => {
    if (!newTableNumber) return;
    await api.post('/admin/tables', { number: Number(newTableNumber) });
    setNewTableNumber('');
    await loadAll();
  };

  const deleteTable = (table: Table) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer la table',
      message: `Voulez-vous vraiment supprimer la table #${table.number} ? Cette action est irreversible.`,
      onConfirm: async () => {
        await api.delete(`/admin/tables/${table.id}`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await loadAll();
      },
    });
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
              <div key={cat.id} className={`rounded-2xl p-3 flex items-center justify-between ${cat.isActive ? 'bg-white/70' : 'bg-gray-200/70 opacity-60'}`}>
                <div className="flex items-center gap-2">
                  <span>{cat.name}</span>
                  {!cat.isActive && <span className="text-xs bg-tomato-100 text-tomato-700 px-2 py-0.5 rounded-full">Inactif</span>}
                </div>
                <div className="flex gap-2">
                  <button className={cat.isActive ? 'button-secondary' : 'button-primary'} onClick={() => toggleCategory(cat)}>
                    {cat.isActive ? 'Desactiver' : 'Reactiver'}
                  </button>
                  <button className="button-secondary text-tomato-600" onClick={() => deleteCategory(cat)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card glass p-6">
          <h2 className="font-display text-2xl mb-4">Produits</h2>
          <div className="grid gap-2 mb-4">
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Nom du produit *"
              value={newItem.name}
              onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Ingredients (visible clients)"
              value={newItem.ingredients}
              onChange={(e) => setNewItem((prev) => ({ ...prev, ingredients: e.target.value }))}
            />
            <textarea
              className="rounded-2xl border border-basil-200 px-4 py-2 min-h-[60px]"
              placeholder={`Mode operatoire (${newItem.type === 'DRINK' ? 'Bar' : 'Cuisine'} uniquement)`}
              value={newItem.recipeText}
              onChange={(e) => setNewItem((prev) => ({ ...prev, recipeText: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-2xl border border-basil-200 px-4 py-2"
                placeholder="Prix (DZD) *"
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
            </div>
            <select
              className="rounded-2xl border border-basil-200 px-4 py-2"
              value={newItem.type}
              onChange={(e) => setNewItem((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="FOOD">FOOD (Cuisine)</option>
              <option value="DRINK">DRINK (Bar)</option>
            </select>
            <button className="button-primary" onClick={createItem}>Ajouter</button>
          </div>
          <div className="space-y-2 max-h-96 overflow-auto">
            {items.map((item) => (
              <div key={item.id} className={`rounded-2xl p-3 flex items-center justify-between ${item.isAvailable ? 'bg-white/70' : 'bg-gray-200/70 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.name}</p>
                    {!item.isAvailable && <span className="text-xs bg-tomato-100 text-tomato-700 px-2 py-0.5 rounded-full">Inactif</span>}
                  </div>
                  <p className="text-xs text-ink/60">{item.type === 'FOOD' ? 'Cuisine' : 'Bar'} - {item.priceCents} DZD</p>
                  {item.ingredients && <p className="text-xs text-ink/50 mt-1">Ingredients: {item.ingredients}</p>}
                  {item.recipeText && <p className="text-xs text-tomato-600 mt-1">Mode operatoire: {item.recipeText.substring(0, 50)}{item.recipeText.length > 50 ? '...' : ''}</p>}
                </div>
                <div className="flex gap-2 ml-2">
                  <button className={item.isAvailable ? 'button-secondary' : 'button-primary'} onClick={() => toggleItem(item)}>
                    {item.isAvailable ? 'Desactiver' : 'Reactiver'}
                  </button>
                  <button className="button-secondary text-tomato-600" onClick={() => deleteItem(item)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card glass p-6">
          <h2 className="font-display text-2xl mb-4">Utilisateurs</h2>
          <div className="grid gap-2 mb-4">
            <input
              className="rounded-2xl border border-basil-200 px-4 py-2"
              placeholder="Nom *"
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-2xl border border-basil-200 px-4 py-2"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              />
              <input
                className="rounded-2xl border border-basil-200 px-4 py-2"
                placeholder="Mot de passe"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-2xl border border-basil-200 px-4 py-2"
                placeholder="PIN (4 chiffres)"
                maxLength={4}
                value={newUser.pin}
                onChange={(e) => setNewUser((prev) => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
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
            </div>
            <button className="button-primary w-full" onClick={createUser}>Ajouter</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {users.map((user) => (
              <div key={user.id} className={`rounded-2xl p-3 flex items-center justify-between ${user.isActive ? 'bg-white/70' : 'bg-gray-200/70 opacity-60'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{user.name}</p>
                    {!user.isActive && <span className="text-xs bg-tomato-100 text-tomato-700 px-2 py-0.5 rounded-full">Inactif</span>}
                  </div>
                  <p className="text-xs text-ink/60">{user.role}</p>
                </div>
                <div className="flex gap-2">
                  <button className={user.isActive ? 'button-secondary' : 'button-primary'} onClick={() => toggleUser(user)}>
                    {user.isActive ? 'Desactiver' : 'Reactiver'}
                  </button>
                  <button className="button-secondary text-tomato-600" onClick={() => deleteUser(user)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card glass p-6">
          <h2 className="font-display text-2xl mb-4">Tables</h2>
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
                <button className="button-secondary mt-2 w-full" onClick={() => deleteTable(table)}>Supprimer</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
