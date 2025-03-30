import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, businessProfiles, professionalProfiles } from "@/lib/db/schema"
import { eq, like, or, desc, count, and } from "drizzle-orm"
import { Search, UserCog } from "lucide-react"

export default async function AdminUsersPage({ searchParams }) {
  const user = await getCurrentUser()

  if (!user || !hasPermission(user, "manage_users")) {
    redirect("/")
  }

  const page = Number(searchParams?.page) || 1
  const limit = Number(searchParams?.limit) || 20
  const search = searchParams?.search || ""
  const role = searchParams?.role || ""

  const skip = (page - 1) * limit

  // Build filter conditions
  let whereClause = {}

  if (search) {
    whereClause = or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
  }

  if (role) {
    whereClause = and(whereClause, eq(users.role, role))
  }

  // Get users with pagination
  const usersList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      businessName: businessProfiles.companyName,
      professionalName: professionalProfiles.fullName,
      professionalTitle: professionalProfiles.title,
    })
    .from(users)
    .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
    .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(skip)

  // Get total count for pagination
  const totalUsersResult = await db.select({ value: count() }).from(users).where(whereClause)

  const totalUsers = totalUsersResult[0]?.value || 0

  const totalPages = Math.ceil(totalUsers / limit)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and their permissions</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="h-5 w-5 mr-2" />
            Users
          </CardTitle>
          <CardDescription>View and manage all users on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search by name or email" className="pl-8" defaultValue={search} />
            </div>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              defaultValue={role}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="BUSINESS">Business</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="USER">User</option>
            </select>
            <Button>Filter</Button>
          </div>

          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersList.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-sm">{user.businessName || user.professionalName || user.name}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "BUSINESS"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "PROFESSIONAL"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/admin/users/${user.id}`} className="text-primary hover:underline mr-3">
                        View
                      </Link>
                      <Link href={`/admin/users/${user.id}/edit`} className="text-primary hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {skip + 1}-{Math.min(skip + usersList.length, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                  <Link href={`/admin/users?page=${page - 1}&limit=${limit}&search=${search}&role=${role}`}>
                    Previous
                  </Link>
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                  <Link href={`/admin/users?page=${page + 1}&limit=${limit}&search=${search}&role=${role}`}>Next</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

