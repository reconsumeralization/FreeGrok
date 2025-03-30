import { db } from "@/db"
import { opportunities } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getOpportunities() {
  return await db.select().from(opportunities)
}

export async function getOpportunityById(id: number) {
  return await db.select().from(opportunities).where(eq(opportunities.id, id))
}

export async function createOpportunity(data: typeof opportunities.$inferInsert) {
  return await db.insert(opportunities).values(data)
}

export async function updateOpportunity(id: number, data: typeof opportunities.$inferUpdate) {
  return await db.update(opportunities).set(data).where(eq(opportunities.id, id))
}

export async function deleteOpportunity(id: number) {
  return await db.delete(opportunities).where(eq(opportunities.id, id))
}

