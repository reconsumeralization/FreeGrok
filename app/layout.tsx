import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CredentialsProvider } from "@/contexts/credentials-context"
import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "B2B Social Networking Platform",
  description: "Connect with professionals, share knowledge, and grow your business network.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CredentialsProvider>
            <div className="flex flex-col min-h-screen">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                  <div className="mr-4 flex">
                    <a href="/" className="flex items-center space-x-2">
                      <span className="font-bold text-xl">B2B Network</span>
                    </a>
                  </div>
                  <MainNav />
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </CredentialsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'