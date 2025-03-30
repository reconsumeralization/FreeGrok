import type { Metadata } from "next"
import SignUpClientPage from "./SignUpClientPage"

export const metadata: Metadata = {
  title: "Sign Up | B2B Network",
  description: "Create a new B2B Network account.",
}

export default function SignUpPage() {
  return <SignUpClientPage />
}

