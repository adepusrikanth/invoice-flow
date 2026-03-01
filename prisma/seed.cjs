/**
 * Dummy data seed for InvoiceFlow. Run: npx prisma db seed
 * Creates one demo user (demo@invoiceflow.local / password: demo123), 3 clients, and 6 invoices.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@invoiceflow.local';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const hashed = await bcrypt.hash('demo123', 10);
    user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: 'Demo User',
        role: 'member',
      },
    });
    console.log('Created user:', email, '(password: demo123)');
  } else {
    console.log('User exists:', email);
  }

  const clients = [
    { name: 'Acme Corp', email: 'billing@acme.com', company: 'Acme Corp' },
    { name: 'TechStart Inc', email: 'accounts@techstart.io', company: 'TechStart Inc' },
    { name: 'Global Services', email: 'finance@globalservices.com', company: 'Global Services Ltd' },
  ];

  const createdClients = [];
  for (const c of clients) {
    const existing = await prisma.client.findFirst({
      where: { userId: user.id, email: c.email },
    });
    if (!existing) {
      const client = await prisma.client.create({
        data: {
          userId: user.id,
          name: c.name,
          email: c.email,
          company: c.company,
        },
      });
      createdClients.push(client);
    }
  }
  if (createdClients.length) {
    console.log('Created', createdClients.length, 'clients');
  }

  const count = await prisma.invoice.count({ where: { userId: user.id } });
  if (count >= 6) {
    console.log('Invoices already exist (', count, '). Skip creating more.');
    return;
  }

  const clientIds = await prisma.client.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
  });
  if (clientIds.length === 0) {
    console.log('No clients. Run seed again after clients exist.');
    return;
  }

  const now = new Date();
  const invoices = [
    { clientIndex: 0, issue: -30, total: 50000, currency: 'INR', status: 'paid' },
    { clientIndex: 0, issue: -15, total: 75000, currency: 'INR', status: 'sent' },
    { clientIndex: 1, issue: -45, total: 120000, currency: 'INR', status: 'paid' },
    { clientIndex: 1, issue: -10, total: 35000, currency: 'USD', status: 'draft' },
    { clientIndex: 2, issue: -20, total: 90000, currency: 'INR', status: 'overdue' },
    { clientIndex: 2, issue: -5, total: 25000, currency: 'INR', status: 'sent' },
  ];

  for (let i = 0; i < invoices.length; i++) {
    const inv = invoices[i];
    const issueDate = new Date(now);
    issueDate.setDate(issueDate.getDate() + inv.issue);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const client = clientIds[inv.clientIndex];
    const invoiceNumber = `INV-${String(count + i + 1).padStart(4, '0')}`;
    const amountPaid = inv.status === 'paid' ? inv.total : 0;
    const amountDue = inv.total - amountPaid;

    await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: client.id,
        invoiceNumber,
        status: inv.status,
        issueDate: issueDate.toISOString().slice(0, 10),
        dueDate: dueDate.toISOString().slice(0, 10),
        currency: inv.currency,
        subtotal: inv.total,
        taxAmount: 0,
        total: inv.total,
        amountPaid,
        amountDue,
        viewToken: `v_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
        items: {
          create: [
            {
              description: `Service / Product for ${client.name}`,
              quantity: 1,
              unitPrice: inv.total,
              amount: inv.total,
              sortOrder: 0,
            },
          ],
        },
      },
    });
  }
  console.log('Created 6 dummy invoices. Log in as', email, 'with password demo123 to test chat and PDF.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
