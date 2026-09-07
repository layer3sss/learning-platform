import { MemoryStore } from './memoryStore.js';
import { PrismaStore } from './prismaStore.js';
import type { DataStore } from './store-types.js';

/**
 * Store selection:
 * - DATABASE_URL set  -> PostgreSQL via Prisma (persistent, multi-user safe)
 * - DATABASE_URL unset -> in-memory fallback (zero-friction local dev / preview)
 */
export function createStore(): DataStore {
  if (process.env.DATABASE_URL) {
    return new PrismaStore();
  }
  return new MemoryStore();
}

export type { DataStore } from './store-types.js';
