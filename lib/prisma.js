import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function buildDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes("pgbouncer=true")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}pgbouncer=true`;
}

function createClient() {
  const url = buildDatabaseUrl();
  if (!url) return new PrismaClient();
  return new PrismaClient({ datasources: { db: { url } } });
}

export const prisma = globalForPrisma.prisma || createClient();

globalForPrisma.prisma = prisma;
