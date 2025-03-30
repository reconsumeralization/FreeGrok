import { db } from "@/db"
import { views } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function increment(slug: string, by = 1) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingView = await db.query.views.findFirst({
      where: (view, { eq, and }) => and(eq(view.slug, slug), eq(view.date, today)),
    })

    if (existingView) {
      await db
        .update(views)
        .set({ count: existingView.count + by })
        .where(and(eq(views.slug, slug), eq(views.date, today)))
    } else {
      await db.insert(views).values({ slug: slug, date: today, count: by })
    }
  } catch (e) {
    console.error(e)
  }
}

export async function getViews(slug: string): Promise<number> {
  try {
    const result = await db.select({ count: views.count }).from(views).where(eq(views.slug, slug))
    return result.reduce((acc, curr) => acc + curr.count, 0)
  } catch (e) {
    console.error(e)
    return 0
  }
}

