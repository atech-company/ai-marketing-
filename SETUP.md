# AI Website Marketing Discovery Platform — Setup

Monorepo layout:

- `backend/` — Laravel 13 REST API, queues, crawling, OpenAI
- `frontend/` — Next.js 16 (App Router) + TypeScript + Tailwind CSS v4

## Prerequisites

- PHP 8.3+, Composer
- Node.js 20+ and npm
- MySQL 8+ (recommended) or SQLite for local smoke tests
- Redis (recommended for `QUEUE_CONNECTION=redis` and cache)
- OpenAI API key
- Chromium for Playwright (installed via npm in the runner package)

## 1. Backend (Laravel)

```powershell
cd backend
copy .env.example .env
php artisan key:generate
```

Configure `.env`:

- `APP_URL` — public URL of the API (e.g. `http://127.0.0.1:8000`)
- `DB_*` — **MySQL** by default (`DB_DATABASE=aianalytic`). Create an empty database in Laragon/MySQL, then run `php artisan migrate`. For SQLite-only dev, see comments in `backend/.env.example`.
- `QUEUE_CONNECTION` — `redis` (set `REDIS_*`) or `database` for development
- `CACHE_STORE` — `redis` or `database`
- `OPENAI_API_KEY` — required
- `OPENAI_MODEL` — default `gpt-4o-mini` (override in `.env` or `config/marketing.php`)
- `CRAWL_*` — optional tuning (max pages, timeouts, SSL verification)

Run migrations:

```powershell
php artisan migrate
```

### Playwright runner

```powershell
cd playwright-runner
npm install
npx playwright install chromium
```

The API invokes `playwright-runner/render.mjs` via `node` (override with `PLAYWRIGHT_NODE_BINARY` or `PLAYWRIGHT_SCRIPT_PATH` if needed).

### Queue worker (required — or nothing runs)

Creating a project only **queues** work. Until a worker runs, status stays **`pending`**, **0 pages** crawled, and you see no AI output.

**Keep this open in its own terminal** while you use the app:

```powershell
cd backend
php artisan queue:work database --tries=1 --timeout=300
```

If `.env` has `QUEUE_CONNECTION=redis`, use `redis` instead of `database` (and ensure Redis is running).

**Check stuck jobs:** `php artisan queue:failed` — then `php artisan queue:retry all` after fixing the cause.

### Troubleshooting: “Pending” forever

1. **No queue worker** — start `queue:work` (above).
2. **`OPENAI_API_KEY` empty** — job may end as **failed**; set the key in `backend/.env`, run `php artisan config:clear`, retry failed jobs.
3. **MySQL / migrate** — run `php artisan migrate` so `jobs` and `projects` tables exist.
4. **Frontend API URL** — `NEXT_PUBLIC_API_URL` must match `php artisan serve` (e.g. `http://127.0.0.1:8000`).

### API server

```powershell
php artisan serve
```

Sanctum issues Bearer tokens for the SPA. CORS is enabled for `api/*` (see `config/cors.php`).

## 2. Frontend (Next.js)

```powershell
cd frontend
copy .env.example .env.local
```

Set:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Install and run:

```powershell
npm install
npm run dev
```

If you see **`Cannot find module '...\node_modules\next\...'`**, the `next` package was removed or corrupted (e.g. after a failed `rebuild`). From `frontend`, run **`npm install`** again (or `npm install next@16.2.2 --save`) to restore it.

Open the printed localhost URL (default `http://localhost:3000`).

**Windows:** If `@next/swc-win32-x64-msvc` fails to install (file lock, antivirus, or network), the dev script uses **`next dev --webpack`** so the app runs with WASM fallback instead of Turbopack. To restore native SWC later: close editors using `node_modules`, run `npm install` again, then `npm rebuild @next/swc-win32-x64-msvc`.

## 3. Smoke test

1. Register at `/register`
2. Create a project from the dashboard
3. Ensure a queue worker is running; watch status on the project page (polls while `pending` / `crawling` / `analyzing`)
4. **Social templates** (dashboard → *Social templates*): `POST /api/social-templates` with a product URL runs **synchronously** in the request (no queue). Playwright must be installed if many sites need JS rendering.

## 4. Production notes

- Terminate TLS at your reverse proxy; set `APP_URL`, `FRONTEND_URL`, and tighten `config/cors.php` `allowed_origins`
- Use Redis for queues and cache at scale
- Run `php artisan config:cache route:cache` on deploy
- Restrict crawl targets and rate-limit `/api/register` / `/api/login` as needed
- Playwright needs OS dependencies on Linux servers (`npx playwright install-deps chromium` where supported)

## 5. Upload & deploy (production)

This app is **two parts**: Laravel API (`backend/`) and Next.js UI (`frontend/`). Shared PHP-only hosting usually cannot run **Node** or **Playwright**; plan for a **VPS**, **two services** (API + frontend), or **frontend on Vercel/Netlify** + API on your PHP host.

### 5.0 Go online end-to-end (shared hosting + free frontend)

Use this path if you have **Hostinger (or similar) shared** hosting and want the whole product reachable on the internet.

| Step | Where | What to do |
|------|--------|------------|
| 1 | **GitHub** | Create a repo and push this project (you can keep it private). |
| 2 | **Hostinger hPanel** | **Domains** → add a **subdomain** for the API, e.g. `api.yourdomain.com`. |
| 3 | **Hostinger** | **Databases** → create a **MySQL** database and user; note host, name, user, password. |
| 4 | **Hostinger** | **Advanced** → **PHP Configuration**: PHP **8.3+** for that subdomain/site. |
| 5 | **Hostinger** | **Websites** → manage the **api** subdomain → set **document root** to the folder that contains Laravel’s **`public`** directory (i.e. `.../backend/public`, not `backend/`). If you upload the whole repo, point the subdomain to `aianalytic/backend/public` or move only `backend` up so `public_html` = contents of `backend/public`. |
| 6 | **Upload** | **File Manager** or **FTP**: upload the **`backend`** folder (no `vendor`, no local `.env`). Prefer **ZIP upload + extract** on the server, then run **Composer** (SSH or hPanel **Composer** if available): `composer install --no-dev --optimize-autoloader` inside the folder that contains `artisan`. |
| 7 | **Configure** | Copy `.env.example` → `.env`, run `php artisan key:generate`. Set at least: `APP_URL=https://api.yourdomain.com`, `APP_ENV=production`, `APP_DEBUG=false`, **MySQL** `DB_*`, `OPENAI_API_KEY`, `QUEUE_CONNECTION=database`. Leave Playwright/Node unset on shared hosting unless you know Node works. |
| 8 | **Migrate** | SSH (or terminal in hPanel): `php artisan migrate --force` then `php artisan config:cache` and `php artisan route:cache`. |
| 9 | **Cron** | **Advanced → Cron Jobs**: every minute, run the queue command (see **§5.5**) so projects don’t stay **pending**. |
| 10 | **Test API** | Open `https://api.yourdomain.com` — you should see the Laravel welcome/default response. API routes are under `/api/...`. |
| 11 | **Vercel** | [vercel.com](https://vercel.com) → **Add New** → **Project** → **Import** your GitHub repo. Set **Root Directory** to **`frontend`**. **Environment variable**: `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com` (no trailing slash). **Build**: `npm install` (default) + `npm run build`. Deploy. |
| 12 | **Smoke test** | Open the **Vercel URL**, register an account, create a project; confirm status moves past **pending** after Cron processes the queue. |

**SSL:** Turn on **free SSL** (Let’s Encrypt) in hPanel for `api.yourdomain.com` and use **https** in `APP_URL` and `NEXT_PUBLIC_API_URL`.

**CORS:** The API ships with permissive CORS for development (`config/cors.php`). For production you may restrict `allowed_origins` to your Vercel domain only.

If you use a **VPS** instead of shared hosting, you can host **both** Laravel and Next.js on the same machine (see §5.2–5.3) and use **Supervisor** for `queue:work` instead of Cron.

### 5.1 What to upload

- **Prefer Git**: push to GitHub/GitLab, clone on the server (no giant ZIPs, easy updates).
- **If you use FTP/SFTP**: upload the project folder but **exclude** (or delete on the server after upload):
  - `frontend/node_modules`, `frontend/.next`
  - `backend/vendor` (reinstall on the server with Composer)
  - `.git` (optional), local `.env` files — **create fresh `.env` on the server**; never upload secrets from your PC.

### 5.2 Backend (Laravel) on the server

1. PHP **8.3+**, **Composer**, **MySQL**, extensions Laravel needs (`openssl`, `pdo_mysql`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`).
2. Point the web root **document root** to `backend/public` (or map a subdomain `api.yoursite.com` → that folder).
3. SSH into the server:

```bash
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
# Edit .env: APP_URL, DB_*, OPENAI_API_KEY, QUEUE_CONNECTION, SANCTUM, CORS origins for your frontend URL
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

4. **Queue worker** (required for projects/crawls): use **Supervisor** or a process manager to run continuously:

`php artisan queue:work database --sleep=3 --tries=1 --timeout=300`

(Use `redis` instead of `database` if `QUEUE_CONNECTION=redis`.)

5. **Scheduler** (if you add cron jobs later): `* * * * * cd /path/to/backend && php artisan schedule:run`.

6. **Playwright** (JS page rendering): install Node on the server, then from `playwright-runner/` run `npm ci` and `npx playwright install chromium` (and Linux deps if needed). Set `PLAYWRIGHT_*` in `.env` if paths differ.

### 5.3 Frontend (Next.js)

The UI must be built with Node, then served with **`npm run start`** (or hosted on Vercel/Netlify).

On the **same VPS** as the API:

```bash
cd frontend
npm ci
npm run build
# Production URL of your API:
echo 'NEXT_PUBLIC_API_URL=https://api.yoursite.com' > .env.production
npm run build
# Run (behind Nginx reverse proxy on port 3000, or use PM2):
npm run start
```

Set **`NEXT_PUBLIC_API_URL`** to your **public HTTPS API base URL** (no trailing slash), matching `APP_URL` / CORS on Laravel.

On **Vercel**: connect the repo, root directory `frontend`, set env `NEXT_PUBLIC_API_URL`, build command `npm run build`, output default. Allow your Vercel origin in Laravel `config/cors.php` / `FRONTEND_URL`.

### 5.4 After deploy — checklist

- [ ] `https://api.../api/...` responds; frontend loads and can **register/login**
- [ ] `php artisan queue:work` is running (or projects stay **pending** forever)
- [ ] Crawl/AI jobs complete; Playwright path works if you use JS rendering

### 5.5 Hostinger **shared** hosting (realistic setup)

#### If you **only** have shared hosting (no VPS)

A **single** shared PHP plan cannot run the **Next.js** app (`npm run start`) or **Playwright** the way a VPS does. That is a platform limit, not a mistake in this repo.

**What still works with “only shared”:**

| Where | What you deploy |
|--------|------------------|
| **Your Hostinger shared account** | Laravel **API** only — upload/configure `backend/`, point the subdomain document root to `backend/public`, MySQL, **Cron** for the queue |
| **Free tier elsewhere** (required for the UI) | **Next.js** on [Vercel](https://vercel.com), [Netlify](https://netlify.com), or [Cloudflare Pages](https://pages.cloudflare.com) — connect your Git repo, set root to `frontend`, env `NEXT_PUBLIC_API_URL=https://api.yourdomain.com` |

You are **not** buying a second server: the dashboard is a static/serverless build on a free host; the API stays on Hostinger. If you insist that **everything** must stay inside Hostinger with no external service, you would need **Hostinger VPS** or **Business Cloud**–style Node support (check their current docs), not basic shared PHP-only hosting.

---

Shared plans are built for **PHP + MySQL**. This project also needs **Node** (Next.js) and optionally **Playwright** (headless Chrome). On typical Hostinger shared hosting:

| Piece | On shared Hostinger? |
|--------|----------------------|
| Laravel API (`backend/`) | **Yes**, if PHP ≥ 8.3, MySQL, Composer (SSH or hPanel Composer) |
| Next.js UI (`frontend/`) | **Not** as a long-running Node server on basic shared — use **Vercel**, **Netlify**, or **Cloudflare Pages** (free) and point `NEXT_PUBLIC_API_URL` to your API |
| Playwright / JS crawl | **No** — you cannot install Chromium like on a VPS. Crawls use **HTTP fetch** only; some sites may render incompletely |
| Queue worker (`queue:work`) | **No** Supervisor — use **Cron** to process jobs (see below) |

**Recommended split**

1. **Subdomain for API**, e.g. `api.yourdomain.com` → document root = `backend/public` (upload `backend` contents and set `public` as the web root for that subdomain in hPanel).
2. **Frontend on Vercel** (import GitHub repo, root directory `frontend`, env `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`).
3. In **Laravel** `.env**: `APP_URL=https://api.yourdomain.com`, set `FRONTEND_URL` (if used) and **CORS** so your Vercel URL is allowed (see `config/cors.php`).

**Upload via hPanel**

- **File Manager** or **FTP**: upload the `backend` tree (without `vendor`; run `composer install` on the server if SSH exists).
- `.env` on the server only; never commit real keys.

**Database**: create MySQL DB in hPanel → put credentials in `backend/.env`.

**Queues without Supervisor** (Cron in hPanel → **Advanced → Cron Jobs**), run **every minute**, adjust path to your `backend` folder:

```text
* * * * * cd /home/USERNAME/domains/api.yourdomain.com/public_html && /usr/bin/php artisan queue:work database --stop-when-empty --max-time=55 >> /dev/null 2>&1
```

Use the **full path** to `php` from Hostinger docs if different (`php -v` over SSH). If `--max-time` is unsupported, use:

```text
* * * * * cd /path/to/backend && php artisan queue:work database --once
```

(one job per minute — slow but works).

**`.env` tips for shared**

- `QUEUE_CONNECTION=database` (Redis is rarely available on shared)
- `CACHE_STORE=database` or `file`
- You usually **omit** `playwright-runner` and Node on shared hosting. Crawling still uses **HTTP** first; Playwright only runs if the script exists and Node works. **Social templates** may call Playwright for thin pages — JS-heavy URLs can fail until you move to a VPS or install Node + Playwright on a path Hostinger allows (uncommon on shared)

**When you outgrow shared**: move the API to a **VPS** (Hostinger VPS or another provider) for full **Node + Playwright + Supervisor** on one machine.
