/**
 * Shared PrismaClient singleton for the 4 live products' real DB tasks (SentinelPOS, MiniERP,
 * RouteMatrix, BatchCraft — see prisma/schema.prisma). One instance per process, reused by every
 * product's router/worker/service, same reasoning as onedev-client.js's shared fetch wrapper: a
 * separate `new PrismaClient()` per file each opens its own connection pool, which is how you
 * accidentally exhaust Postgres's max_connections under real load.
 */
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
