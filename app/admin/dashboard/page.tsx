import Link from "next/link"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, businessProfiles, professionalProfiles, posts, reports, activityLogs, errorLogs } from "@/lib/db/schema"
import { count, eq, desc, gte } from "drizzle-orm"
import { AlertTriangle, CheckCircle, Activity, Flag, Server } from "lucide-react"

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user || !hasPermission(user, "manage_settings")) {
    redirect("/")
  }

  // Get platform statistics
  const totalUsersResult = await db.select({ value: count() }).from(users)
  const totalUsers = totalUsersResult[0]?.value || 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const newUsersTodayResult = await db.select({ value: count() }).from(users).where(gte(users.createdAt, today))
  const newUsersToday = newUsersTodayResult[0]?.value || 0

  const totalBusinessesResult = await db.select({ value: count() }).from(businessProfiles)
  const totalBusinesses = totalBusinessesResult[0]?.value || 0

  const totalProfessionalsResult = await db.select({ value: count() }).from(professionalProfiles)
  const totalProfessionals = totalProfessionalsResult[0]?.value || 0

  const totalPostsResult = await db.select({ value: count() }).from(posts)
  const totalPosts = totalPostsResult[0]?.value || 0

  const totalReportsResult = await db.select({ value: count() }).from(reports)
  const totalReports = totalReportsResult[0]?.value || 0

  const pendingReportsResult = await db.select({ value: count() }).from(reports).where(eq(reports.status, "PENDING"))
  const pendingReports = pendingReportsResult[0]?.value || 0

  // Get recent activity logs
  const recentActivity = await db
    .select({
      id: activityLogs.id,
      userId: activityLogs.userId,
      action: activityLogs.action,
      details: activityLogs.details,
      ipAddress: activityLogs.ipAddress,
      createdAt: activityLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(10)

  // Get recent error logs
  const recentErrors = await db.select().from(errorLogs).orderBy(desc(errorLogs.timestamp)).limit(10)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform management and monitoring</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">+{newUsersToday}</span>
              <span className="ml-1">new today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Businesses</CardDescription>
            <CardTitle className="text-3xl">{totalBusinesses}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <span className="text-muted-foreground">{Math.round((totalBusinesses / totalUsers) * 100)}%</span>
              <span className="ml-1">of total users</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Professionals</CardDescription>
            <CardTitle className="text-3xl">{totalProfessionals}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <span className="text-muted-foreground">{Math.round((totalProfessionals / totalUsers) * 100)}%</span>
              <span className="ml-1">of total users</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Content Reports</CardDescription>
            <CardTitle className="text-3xl">{pendingReports}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <span className="text-yellow-500 font-medium">{pendingReports}</span>
              <span className="ml-1">pending review</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList className="mb-6">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="reports">Content Reports</TabsTrigger>
          <TabsTrigger value="errors">System Errors</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Recent user activity on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {recentActivity.map((activity) => (
                          <tr key={activity.id}>
                            <td className="px-4 py-3 text-sm">{activity.userName || "Unknown"}</td>
                            <td className="px-4 py-3 text-sm">{activity.action}</td>
                            <td className="px-4 py-3 text-sm">{new Date(activity.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm">{activity.ipAddress || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent activity found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flag className="h-5 w-5 mr-2" />
                Content Reports
              </CardTitle>
              <CardDescription>Reported content requiring moderation</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReports > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Reason</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Reported By</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {/* This would be populated with actual reports */}
                        <tr>
                          <td className="px-4 py-3 text-sm">Post</td>
                          <td className="px-4 py-3 text-sm">Inappropriate Content</td>
                          <td className="px-4 py-3 text-sm">John Doe</td>
                          <td className="px-4 py-3 text-sm">2023-06-15</td>
                          <td className="px-4 py-3 text-sm">
                            <Link href="/admin/reports/1" className="text-primary hover:underline">
                              Review
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="text-center">
                    <Link href="/admin/reports" className="text-primary hover:underline">
                      View all reports
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                  <p className="mt-2 text-lg font-medium">No pending reports</p>
                  <p className="text-muted-foreground">All content reports have been reviewed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                System Errors
              </CardTitle>
              <CardDescription>Recent system errors and exceptions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentErrors.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Error</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {recentErrors.map((error, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm">{error.message}</td>
                            <td className="px-4 py-3 text-sm">{new Date(error.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm">
                              <Link href={`/admin/errors/${error.id}`} className="text-primary hover:underline">
                                Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                  <p className="mt-2 text-lg font-medium">No recent errors</p>
                  <p className="text-muted-foreground">System is running smoothly</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                System Health
              </CardTitle>
              <CardDescription>Current system status and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Server Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-medium">API Server</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Running normally</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-medium">Database</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Connected</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-medium">Storage</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">50% used</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="font-medium">Memory</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">4GB / 8GB used</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">API Response Time</span>
                        <span className="text-sm font-medium">120ms avg</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full w-[20%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Database Query Time</span>
                        <span className="text-sm font-medium">45ms avg</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full w-[15%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full w-[35%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm font-medium">50%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full w-[50%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

