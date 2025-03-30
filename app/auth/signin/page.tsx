import type { Metadata } from "next"
import SignInClientPage from "./SignInClientPage"

export const metadata: Metadata = {
  title: "Sign In | B2B Network",
  description: "Sign in to your B2B Network account.",
}

export default function SignInPage() {
  return <SignInClientPage />
}

