import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Legal Information",
  description: "Privacy Policy and Terms of Service for our B2B networking platform",
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <div className="sm:w-1/4">
            <nav className="space-y-2 sticky top-20">
              <Link href="/legal/privacy-policy" className="block p-2 hover:bg-accent rounded-md transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/terms-of-service" className="block p-2 hover:bg-accent rounded-md transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
          <div className="sm:w-3/4 prose prose-slate max-w-none dark:prose-invert">{children}</div>
        </div>
      </div>
    </div>
  )
}

