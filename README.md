# AI Marketing — frontend (Next.js)

This repository contains **only** the **Next.js** dashboard. The **Laravel API** is **not** included here (use a separate repo or restore from Git history before `backend/` was removed).

## Local development

```powershell
cd frontend
copy .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL` to your API base URL (e.g. `http://127.0.0.1:8000`), then:

```powershell
npm install
npm run dev
```

## Deploy (Hostinger Node, Vercel, etc.)

- **Root directory:** `frontend` (or a branch where `frontend` is at repo root if the host cannot pick a subfolder).
- **Environment:** `NEXT_PUBLIC_API_URL=https://your-api-domain.com` (HTTPS, no trailing slash).

## Restore the Laravel backend

```powershell
git checkout b91d7b7 -- backend
```

(`b91d7b7` is the last commit that contained `backend/`; use `git log` if needed.)

Or clone [ai-market-tool](https://github.com/atech2021715-commits/ai-market-tool) if that repo still has the full monorepo.
