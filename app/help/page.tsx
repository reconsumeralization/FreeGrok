import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help & Support | B2B Network",
  description: "Get help and support for using the B2B Network platform.",
}

export default function HelpPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">How do I create an account?</h3>
                <p className="text-muted-foreground mt-1">
                  You can create an account by clicking on the "Sign Up" button on the homepage and following the
                  registration process.
                </p>
              </div>
              <div>
                <h3 className="font-medium">How do I connect with other professionals?</h3>
                <p className="text-muted-foreground mt-1">
                  You can search for professionals in your industry and send them connection requests from their profile
                  page.
                </p>
              </div>
              <div>
                <h3 className="font-medium">How do I post content?</h3>
                <p className="text-muted-foreground mt-1">
                  You can create posts from the home feed by clicking on the "Create Post" button at the top of your
                  feed.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Support</h2>
            <p className="text-muted-foreground">
              If you need further assistance, please contact our support team at support@b2bnetwork.com or use the
              contact form on the Contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

