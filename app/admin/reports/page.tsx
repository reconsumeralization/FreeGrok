import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { Flag } from "lucide-react"

const prisma = new PrismaClient()

export default async function AdminReportsPage({ searchParams }) {
  const user = await getCurrentUser()

  if (!user || !hasPermission(user, "manage_content")) {
    redirect("/")
  }

  const page = Number(searchParams?.page) || 1
  const limit = Number(searchParams?.limit) || 20
  const status = searchParams?.status || "PENDING"

  const skip = (page - 1) * limit

  // Get reports with pagination
  const reports = await prisma.report.findMany({
    where: {
      status,
    },
    include: {
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      post: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  })

  // Get total count for pagination
  const totalReports = await prisma.report.count({
    where: {
      status,
    },
  })

  const totalPages = Math.ceil(totalReports / limit)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">Review and moderate reported content</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flag className="h-5 w-5 mr-2" />
            Content Reports
          </CardTitle>
          <CardDescription>Review and take action on reported content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Link href="/admin/reports?status=PENDING">
              <Button variant={status === "PENDING" ? "default" : "outline"}>Pending</Button>
            </Link>
            <Link href="/admin/reports?status=REVIEWED">
              <Button variant={status === "REVIEWED" ? "default" : "outline"}>Reviewed</Button>
            </Link>
            <Link href="/admin/reports?status=ACTIONED">
              <Button variant={status === "ACTIONED" ? "default" : "outline"}>Actioned</Button>
            </Link>
            <Link href="/admin/reports?status=DISMISSED">
              <Button variant={status === "DISMISSED" ? "default" : "outline"}>Dismissed</Button>
            </Link>
          </div>

          {reports.length > 0 ? (
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
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-4 py-3 text-sm">{report.postId ? "Post" : "Comment"}</td>
                      <td className="px-4 py-3 text-sm">{report.reason.replace("_", " ")}</td>
                      <td className="px-4 py-3 text-sm">{report.reportedBy.name}</td>
                      <td className="px-4 py-3 text-sm">{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/admin/reports/${report.id}`} className="text-primary hover:underline">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No reports found</p>
              <p className="text-muted-foreground">There are no {status.toLowerCase()} reports to review</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {skip + 1}-{Math.min(skip + reports.length, totalReports)} of {totalReports} reports
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                  <Link href={`/admin/reports?page=${page - 1}&limit=${limit}&status=${status}`}>Previous</Link>
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                  <Link href={`/admin/reports?page=${page + 1}&limit=${limit}&status=${status}`}>Next</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

