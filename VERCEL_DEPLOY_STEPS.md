# Deploy InvoiceFlow to Vercel (using GitHub repo)

Your repo: **https://github.com/adepusrikanth/invoice-flow**

## Steps (2–3 minutes)

### 1. Open Vercel and import the repo

1. Go to **https://vercel.com** and sign in (use **Continue with GitHub** if needed).
2. Click **Add New…** → **Project**.
3. Under **Import Git Repository**, find **adepusrikanth/invoice-flow**.
   - If it’s not listed, click **Import Third-Party Git Repository** and paste:  
     `https://github.com/adepusrikanth/invoice-flow`
4. Click **Import** next to the repo.

### 2. Configure the project (optional)

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** Leave as `.`
- **Build Command:** `npm run build` (default)
- **Output Directory:** Leave default

### 3. Add environment variables

Click **Environment Variables** and add (at least for a working app):

| Name             | Value                    | Notes                          |
|------------------|--------------------------|--------------------------------|
| `DATABASE_URL`   | Your database URL        | See note below                 |
| `JWT_SECRET`     | Long random string (32+) | For session signing            |
| `OPENAI_API_KEY`| Your OpenAI key          | Only if you use AI features   |

**Database (required for signup/login):** The app uses **PostgreSQL**. You must set `DATABASE_URL` to a Postgres connection string:

- **Vercel Postgres:** In the project, go to **Storage** → **Create Database** → Postgres, then connect it to this project. Vercel will add `POSTGRES_URL` or similar — use that as `DATABASE_URL`.
- **Neon (free):** [neon.tech](https://neon.tech) → Create project → copy the connection string → set as `DATABASE_URL`.
- **Supabase (free):** [supabase.com](https://supabase.com) → New project → Settings → Database → Connection string (URI) → set as `DATABASE_URL`.

The first deploy will run `prisma db push` during build to create tables. **Signup and login will work only after `DATABASE_URL` and `JWT_SECRET` are set.**

### 4. Deploy

1. Click **Deploy**.
2. Wait for the build to finish. Your app will be at:
   - **https://invoice-flow-xxxx.vercel.app** (or the name you gave the project).

### 5. After first deploy

- Every **push to `main`** on GitHub will trigger a new deployment.
- To add a **custom domain:** Project → **Settings** → **Domains**.
- To change **env vars:** Project → **Settings** → **Environment Variables** → Save → redeploy from **Deployments** if needed.

---

**CLI option (after logging in):**  
In your project folder, run `npx vercel login`, complete the browser login, then run `npx vercel --prod` to deploy from the current directory (linked to the same GitHub repo).
