export type Role = 'ADMIN' | 'SERVEUR' | 'BAR' | 'CUISINE';

export type User = {
  id: string;
  name: string;
  role: Role;
  isActive?: boolean;
};

export type Table = {
  id: string;
  number: number;
  status: 'FREE' | 'OCCUPIED';
  currentOrderId?: string | null;
  indicators?: {
    newCount: number;
    inProgress: number;
    done: number;
  };
};

export type MenuCategory = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  ingredients?: string;
  recipeText?: string;
  imageUrl?: string;
  priceCents: number;
  type: 'FOOD' | 'DRINK';
  isAvailable: boolean;
};

export type OrderItem = {
  id: string;
  orderId: string;
  nameSnapshot: string;
  priceCentsSnapshot: number;
  quantity: number;
  notes?: string | null;
  station: 'KITCHEN' | 'BAR';
  status: 'NEW' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  createdAt: string;
};

export type StationQueueItem = OrderItem & {
  tableNumber: number;
  recipeText?: string;
  imageUrl?: string;
};

export type Order = {
  id: string;
  tableId: string;
  status: 'OPEN' | 'SENT' | 'CLOSED' | 'CANCELLED';
  items: OrderItem[];
  table?: {
    id: string;
    number: number;
  };
};
