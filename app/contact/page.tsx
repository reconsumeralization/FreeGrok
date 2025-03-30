import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact | B2B Network",
  description: "Contact the B2B Network team for support or inquiries.",
}

export default function ContactPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-muted-foreground mb-6">
          Have questions or need assistance? Reach out to our team using the contact information below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">General Inquiries</h2>
            <p className="text-muted-foreground">For general questions about our platform:</p>
            <p className="mt-2">
              Email: info@b2bnetwork.com
              <br />
              Phone: +1 (555) 123-4567
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Technical Support</h2>
            <p className="text-muted-foreground">For technical issues or account help:</p>
            <p className="mt-2">
              Email: support@b2bnetwork.com
              <br />
              Phone: +1 (555) 987-6543
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Business Hours</h2>
          <p className="text-muted-foreground">Our support team is available during the following hours:</p>
          <p className="mt-2">
            Monday - Friday: 9:00 AM - 6:00 PM EST
            <br />
            Saturday: 10:00 AM - 2:00 PM EST
            <br />
            Sunday: Closed
          </p>
        </div>
      </div>
    </div>
  )
}

