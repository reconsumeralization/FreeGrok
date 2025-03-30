import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return user
}

export function hasPermission(user, permission) {
  if (!user) return false

  const permissionMap = {
    manage_content: ["ADMIN"],
    manage_users: ["ADMIN"],
    manage_settings: ["ADMIN"],
    create_business: ["BUSINESS", "ADMIN"],
    create_professional: ["PROFESSIONAL", "ADMIN"],
  }

  if (!permissionMap[permission]) return false

  return permissionMap[permission].includes(user.role)
}

