// Vercel Postgres injects POSTGRES_PRISMA_URL when you connect the DB to the project; Prisma schema expects DATABASE_URL
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL)
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
else if (!process.env.DATABASE_URL && process.env.POSTGRES_URL)
  process.env.DATABASE_URL = process.env.POSTGRES_URL;

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
