# InvoiceFlow API Reference

All API routes require authentication via session cookie. Unauthenticated requests return `401 Unauthorized`.

Base URL: same origin (e.g. `https://yourapp.com` or `http://localhost:3000`).

---

## Authentication

- **Login:** `POST /api/auth/login` — body `{ "email", "password" }`
- **Register:** `POST /api/auth/register` — body `{ "email", "password", "name?" }`
- **Session:** `GET /api/auth/me` — returns current user
- **Logout:** `POST /api/auth/logout`

---

## Invoices

- **List:** `GET /api/invoices` — returns `{ invoices }` (user-scoped)
- **Create:** `POST /api/invoices` — body: `clientId?`, `templateId?`, `issueDate`, `dueDate`, `currency?`, `notes?`, `terms?`, `items: [{ description, quantity, unitPrice, amount }]`
- **Get one:** `GET /api/invoices/[id]` — returns `{ invoice }` with client, template, items, payments
- **Update:** `PUT /api/invoices/[id]` — same body as create (only draft)
- **Export CSV:** `GET /api/invoices/[id]/export?format=csv` — returns CSV file (amounts in INR)

---

## Clients

- **List:** `GET /api/clients` — returns `{ clients }`
- **Create:** `POST /api/clients` — body: `name`, `email`, `phone?`, `company?`, `address?`, `taxId?`, `currency?`, `notes?`
- **Get one:** `GET /api/clients/[id]`
- **Update:** `PUT /api/clients/[id]`
- **Delete:** `DELETE /api/clients/[id]`

---

## Templates

- **List:** `GET /api/templates` — returns `{ templates }`
- **Create:** `POST /api/templates` — body: `name`, `businessName`, `businessPhone?`, `businessEmail?`, `businessAddress?`, `accentColor?`
- **Get one:** `GET /api/templates/[id]`
- **Update:** `PUT /api/templates/[id]`
- **Delete:** `DELETE /api/templates/[id]`

---

## Reports (data & export)

All report endpoints return JSON by default. Append `?format=csv` to download CSV.

- **Monthly revenue (INR):** `GET /api/reports/revenue` — returns `{ data: [{ month, revenueInr }], totalInr, totalFormatted }`
- **Outstanding invoices (INR):** `GET /api/reports/outstanding` — returns `{ data: [{ invoiceNumber, clientName, dueDate, status, amountDueInr }], totalInr, totalFormatted }`
- **Client-wise summary (INR):** `GET /api/reports/clients` — returns `{ data: [{ clientName, email, invoiceCount, totalBilledInr, totalPaidInr, outstandingInr }] }`

---

## Chat (RAG Q&A)

- **Ask:** `POST /api/chat` — body `{ "message": "your question" }`. Uses RAG over the user’s invoice data. Answers are in INR. Returns `{ answer }`.

---

## Invoice extract / upload

- **Extract from text:** `POST /api/invoices/extract` — body `{ "text": "raw invoice text" }` — creates draft invoice from extracted data (requires `OPENAI_API_KEY`).
- **Upload:** `POST /api/invoices/upload` — multipart form with file; supports PDF/images for extraction.

---

## Data retrieval summary

| Purpose           | Method | Endpoint                    |
|------------------|--------|-----------------------------|
| List invoices    | GET    | /api/invoices               |
| List clients     | GET    | /api/clients                |
| List templates   | GET    | /api/templates               |
| Revenue report   | GET    | /api/reports/revenue        |
| Outstanding      | GET    | /api/reports/outstanding    |
| Client summary   | GET    | /api/reports/clients        |
| Invoice Q&A      | POST   | /api/chat                   |

All monetary values in reports and chat are normalized to **INR** (Indian Rupees).
