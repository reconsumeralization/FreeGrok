import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | B2B Network",
  description: "Manage your account settings and preferences.",
}

export default function SettingsPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Account Settings</h2>
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground">Account settings will be displayed here.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Privacy Settings</h2>
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground">Privacy settings will be displayed here.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Notification Settings</h2>
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground">Notification settings will be displayed here.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

