# Gioia - PWA prise de commande (MVP production-ready)

## Stack
- Backend: NestJS + TypeScript
- DB: PostgreSQL
- ORM: Prisma
- Frontend: React + Vite + Tailwind
- Realtime: Socket.IO (simple, robuste, support rooms)
- Auth: JWT access + refresh, RBAC, login PIN rapide
- Deploy: docker-compose (db + backend + frontend)

Choix technique: Socket.IO est retenu car il gere nativement les rooms (station/table) et reconnecte sans effort. NestJS est retenu pour la structure et la vitesse de livraison.

## Demarrage rapide

### 1) Copier les variables d'environnement
```
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2) Lancer via Docker
```
docker-compose up --build
```

### 3) Appliquer les migrations + seed
Dans un autre terminal:
```
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
```

Backend: http://localhost:3000
Frontend: http://localhost:5174

## Comptes demo
- Admin: email `admin@gioia.local` / password `Admin1234`
- Serveur: nom `Serveur` / PIN `1234`
- Cuisine: nom `Cuisine` / PIN `5678`
- Bar: nom `Bar` / PIN `9012`

## Fonctionnalites couvertes
- Serveur: selection table, creation auto commande OPEN, ajout items, envoi, suivi temps reel, cloture
- Cuisine/Bar: queue temps reel par station, changements de statut (NEW -> IN_PROGRESS -> DONE)
- Admin: gestion categories, items, utilisateurs, tables
- Realtime: rooms `station:kitchen`, `station:bar`, `table:{tableId}`

## API (principales routes)
Auth:
- POST `/auth/login`
- POST `/auth/refresh`
- POST `/auth/logout`
- GET `/me`

Admin:
- `/admin/users` CRUD
- `/admin/menu/categories` CRUD
- `/admin/menu/items` CRUD
- `/admin/tables/init?count=15`
- `/admin/tables` CRUD

Serveur:
- GET `/tables`
- POST `/tables/:tableId/open-order`
- POST `/orders/:orderId/items`
- POST `/orders/:orderId/send`
- POST `/orders/:orderId/close`
- GET `/orders/:orderId`

Stations:
- GET `/station/kitchen/queue`
- GET `/station/bar/queue`
- PATCH `/order-items/:id/status`

## Workflow attendu
1) Serveur ouvre table 3, ajoute 2 pizzas + 1 coca, envoie.
2) Cuisine voit les pizzas en NEW et passe IN_PROGRESS puis DONE.
3) Bar voit le coca en NEW puis DONE.
4) Serveur voit les statuts evoluer en temps reel.
5) Admin ajoute un item, il apparait cote serveur.

## Structure repo
- `backend/`
- `frontend/`
- `docker-compose.yml`

## Notes
- Un seul order OPEN par table est enforce cote service.
- OrderItem stocke un snapshot du nom/prix au moment de la commande.
- PWA basique via manifest.
