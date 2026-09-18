# Project Pay — Server

REST API for [Project Pay](https://github.com/imSamiul/ProjectPay-Client): projects, clients, payments, and role-based admin tooling.

All versioned endpoints live under `/api/v1`.

## Stack

- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- JWT auth, Zod validation, Helmet, rate limiting
- Pino logging

## Requirements

- Node.js 20+ recommended
- [pnpm](https://pnpm.io/) 9+
- MongoDB reachable at `MONGODB_URL`

## Setup

```bash
pnpm install
cp .env.example .env
```

Configure `.env` (see [Environment](#environment)):

```env
NODE_ENV=development
PORT=4000
MONGODB_URL=mongodb://127.0.0.1:27017/ProjectPay
JWT_TOKEN=change-me-to-a-long-secret
CLIENT_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

Start the API:

```bash
pnpm dev
```

- Health: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- Root probe: [http://localhost:4000/](http://localhost:4000/)

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no | Default `4000` |
| `MONGODB_URL` | yes | Mongo connection string |
| `JWT_TOKEN` | yes | Secret for signing JWTs |
| `CLIENT_ORIGIN` | no | CORS origin (default Vite URL) |
| `NODE_ENV` | no | `development` / `production` |
| `LOG_LEVEL` | no | Pino level (default `info`) |

Never commit `.env`. Only `.env.example` is tracked.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Nodemon + `src/server.ts` |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Run compiled `dist/src/server.js` |
| `pnpm run create-admin` | Seed an admin user |

### Create an admin

```bash
pnpm run create-admin -- --name "Test Admin" --email admin@test.com --phone "+8801700000000" --password secret123
```

## Roles & access

| Role | Typical access |
| --- | --- |
| `client` | Auth (`/user/me`, logout) |
| `project manager` | Manager stats/clients, projects CRUD, payments |
| `admin` | Platform stats, list users/projects, delete users |

Protected routes expect:

```http
Authorization: Bearer <jwt>
```

## API overview

Base URL: `http://localhost:4000/api/v1`

| Area | Examples |
| --- | --- |
| Health | `GET /health` |
| Auth | `POST /user/signUp`, `POST /user/login`, `GET /user/me`, `POST /user/logout` |
| Manager | `GET /manager/stats`, `GET/POST /manager/clients`, `GET /manager/projects` |
| Projects | `POST /projects/create`, `GET /projects/details/:projectCode`, search/update/delete |
| Payments | `POST /payment/add`, update/delete by `paymentId` |
| Admin | `GET /admin/stats`, `GET /admin/users`, `GET /admin/projects`, `DELETE /admin/users/:userId` |

Full request docs and runnable examples: **[bruno/](./bruno/)**.

## Bruno collection

1. Install [Bruno](https://www.usebruno.com/)
2. **Open Collection** → this repo’s `bruno` folder
3. Select environment **Local**
4. Run **01 Auth → Login as project manager** (or Sign up) to save `token`
5. Use Manager / Projects / Payments / Admin folders

Details: [bruno/README.md](./bruno/README.md)

## Project structure

```
src/
  server.ts          # Process entry
  app.ts             # Express app (middleware + /api/v1)
  config/            # Env loading
  db/                # Mongoose connection
  routes/            # Pattern B: index + controller + validators per domain
    users/
    managers/
    projects/
    payments/
    admin/
  services/          # Business logic
  models/            # Mongoose models (kebab-case)
  middleware/        # auth, roles, zod, errors, logger
  scripts/           # create-admin
  utils/
bruno/               # API collection
```

## Local workflow with the client

1. Start MongoDB
2. `pnpm dev` in this repo
3. In the client: set `VITE_API_URL=http://localhost:4000`, then `pnpm dev`
4. Sign up a project manager in the UI, or create an admin with the script above

## Related repos

- Frontend: https://github.com/imSamiul/ProjectPay-Client
- This API: https://github.com/imSamiul/ProjectPay-Server
