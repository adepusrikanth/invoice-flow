# InvoiceFlow AI

Full SaaS application built from the design documents (UI/UX, DB/API, Color Palette, Product Vision). **37 pages** including landing, pricing, auth, dashboard, invoices, clients, payments, reports, expenses, recurring, settings, client portal. The OpenAI API key is **never** exposed to the frontend and is only used server-side via `process.env.OPENAI_API_KEY`.

## Security

- **OpenAI API key**: Loaded only from environment variable `OPENAI_API_KEY` on the server. Never sent to the client, never logged, never committed.
- **Secrets**: `.env`, `.env.local`, and `openai_APIkey.txt` are in `.gitignore`. Do not commit them.
- **Auth**: Session cookies (httpOnly, signed with JWT). Passwords hashed with bcrypt.

## Local setup (test on localhost)

1. **Node**: Use Node 18+.

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment**
   - Create `.env` in the project root with: `DATABASE_URL=file:./dev.db` (Prisma uses this).
   - Create `.env.local` with:
     - `OPENAI_API_KEY=<your key>` (copy the value from `openai_APIkey.txt`; never commit this file or the key).
     - Optional: `JWT_SECRET=<random 32+ char string>`.
   - Do not commit `.env` or `.env.local`.

4. **Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - **http://localhost:3000**

   From there you can register, sign in, paste invoice text or upload `.txt`/`.json` files, and view extracted invoices. AI extraction runs only on the server using `OPENAI_API_KEY`.

## Deploy to GitHub and Vercel

1. **Create a repo** on GitHub named `invoice-flow` (or "invoice flow"): https://github.com/new  
2. **Push this code** (replace `YOUR_USERNAME` with your GitHub username):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/invoice-flow.git
   git branch -M main
   git push -u origin main
   ```
3. **Deploy on Vercel:** Go to [vercel.com](https://vercel.com) → **Add New → Project** → Import your `invoice-flow` repo → add env vars (`DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`) → Deploy.

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions and database notes for Vercel.

- Ensure `.env.local`, `openai_APIkey.txt`, and any secret files are not committed (they are in `.gitignore`).
- Set `OPENAI_API_KEY` and `JWT_SECRET` in your deployment environment (e.g. Vercel env vars); never put them in the repo.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run db:push` | Apply Prisma schema   |
