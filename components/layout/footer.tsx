import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} B2B Network. All rights reserved.
        </p>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/help" className="text-muted-foreground hover:text-foreground">
            Help
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}

