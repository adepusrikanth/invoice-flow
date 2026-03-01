# Deploy InvoiceFlow: GitHub + Vercel

Follow these steps to create the GitHub repo, push your code, and deploy on Vercel.

---

## 1. Create the GitHub repository

1. Go to **https://github.com/new**
2. Set **Repository name** to: `invoice-flow` (or `invoice flow` if you prefer)
3. Choose **Public**
4. **Do not** add a README, .gitignore, or license (this project already has them)
5. Click **Create repository**

---

## 2. Push your code to GitHub

In your project folder, run (replace `YOUR_USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/invoice-flow.git
git branch -M main
git push -u origin main
```

If you use SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/invoice-flow.git
git branch -M main
git push -u origin main
```

**Optional:** Set your git identity for future commits:
```bash
git config --global user.email "your@email.com"
git config --global user.name "Your Name"
```

---

## 3. Deploy on Vercel and connect GitHub

1. Go to **https://vercel.com** and sign in (use **Continue with GitHub**).
2. Click **Add New…** → **Project**.
3. **Import** your `invoice-flow` repo (select it from the list or paste the repo URL).
4. Vercel will detect Next.js. Keep the default settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** (leave default)
5. Add **Environment Variables** (required for the app to work):
   - `DATABASE_URL` — For Vercel you need a hosted database. Options:
     - **Vercel Postgres** (recommended): In the Vercel project, go to **Storage** → create a Postgres database, then link it to the project (adds `POSTGRES_URL`). Use that as `DATABASE_URL`, or see Vercel docs for the exact variable name.
     - **Other:** Any PostgreSQL connection string (e.g. Neon, Supabase). Note: The app uses Prisma with SQLite locally; for production you’d typically switch the Prisma schema to `postgresql` and use a Postgres URL. If you keep SQLite, you’d need a file-based DB solution (not typical on Vercel).
   - `JWT_SECRET` — A long random string (e.g. 32+ characters) for session signing.
   - `OPENAI_API_KEY` — Your OpenAI API key (if you use AI features).
6. Click **Deploy**. Vercel will build and deploy; each push to `main` will trigger a new deployment.

---

## 4. After deployment

- Your app will be at `https://your-project.vercel.app`.
- To use a custom domain: Project → **Settings** → **Domains**.
- To change env vars: Project → **Settings** → **Environment Variables**, then redeploy.

---

## Database note for Vercel

This project’s Prisma schema uses **SQLite** by default (`provider = "sqlite"`). Vercel’s serverless environment does not persist a local SQLite file. For production on Vercel you have two options:

1. **Use PostgreSQL:** Create a Postgres DB (e.g. Vercel Postgres, Neon, Supabase), set `DATABASE_URL` to its connection string, and change `provider` in `prisma/schema.prisma` to `"postgresql"`. Then run `npx prisma generate` and `npx prisma db push` (or migrations) against that DB.
2. **Keep SQLite for a quick demo:** You can try Vercel’s experimental support or a SQLite-compatible host; for a real production app, PostgreSQL is recommended.

Once `DATABASE_URL` points to a Postgres DB and the schema is updated, the same GitHub → Vercel flow will work with your database.
