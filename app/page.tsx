import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connect, Collaborate, Grow
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The professional networking platform designed for businesses and professionals to connect, share
                  insights, and grow together.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/signin">
                  <Button size="lg">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" size="lg">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Connect</h3>
                  <p className="text-muted-foreground">
                    Build your professional network with like-minded individuals and businesses in your industry.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Collaborate</h3>
                  <p className="text-muted-foreground">
                    Share insights, exchange ideas, and collaborate on projects with your professional connections.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Grow</h3>
                  <p className="text-muted-foreground">
                    Expand your business opportunities, discover new partnerships, and grow your professional presence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

