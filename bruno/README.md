# ProjectPay Bruno collection

Open this folder in [Bruno](https://www.usebruno.com/) (**Open Collection** → select `bruno/`).

## Setup

1. Start the API: `pnpm dev` (default `http://localhost:4000`)
2. In Bruno, select environment **Local**
3. Run **01 Auth → Login as project manager** (or Sign up) so `token` is saved
4. Use Manager / Projects / Payments with that token
5. For Admin requests, login with an admin user (create via `pnpm run create-admin`)

## Environments

| Variable | Purpose |
| --- | --- |
| `baseUrl` | API prefix (`http://localhost:4000/api/v1`) |
| `token` | JWT (set by login / sign-up scripts) |
| `projectId` / `projectCode` | Set by Create Project |
| `paymentId` | Set by Add Payment |
| `userId` | Set by Admin → List Users (first row) |

Do not commit real secrets into environment files.

## Folders

| Folder | Role |
| --- | --- |
| `00 Health` | Public health |
| `01 Auth` | Sign up / login / me / logout |
| `02 Manager` | Stats, projects list, clients |
| `03 Projects` | CRUD + search |
| `04 Payments` | Add / update / delete |
| `05 Admin` | Platform stats / users / projects |
