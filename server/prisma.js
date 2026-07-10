const { PrismaClient } = require("@prisma/client");

// Reuse a single instance across the app (and across hot reloads in dev)
// so we don't exhaust Neon's connection limit.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
