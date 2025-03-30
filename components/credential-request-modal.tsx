"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface CredentialRequestModalProps {
  credentialKey: string
  reason: string
  onSubmit: (value: string) => void
  onCancel: () => void
}

export function CredentialRequestModal({ credentialKey, reason, onSubmit, onCancel }: CredentialRequestModalProps) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!value.trim()) {
      setError("Please enter a valid value")
      return
    }
    onSubmit(value)
  }

  const getCredentialLabel = () => {
    switch (credentialKey) {
      case "OPENAI_API_KEY":
        return "OpenAI API Key"
      case "STRIPE_SECRET_KEY":
        return "Stripe Secret Key"
      case "STRIPE_WEBHOOK_SECRET":
        return "Stripe Webhook Secret"
      case "NEXTAUTH_SECRET":
        return "NextAuth Secret"
      case "GOOGLE_CLIENT_ID":
        return "Google Client ID"
      case "GOOGLE_CLIENT_SECRET":
        return "Google Client Secret"
      case "LINKEDIN_CLIENT_ID":
        return "LinkedIn Client ID"
      case "LINKEDIN_CLIENT_SECRET":
        return "LinkedIn Client Secret"
      default:
        return credentialKey
    }
  }

  const getCredentialHelp = () => {
    switch (credentialKey) {
      case "OPENAI_API_KEY":
        return "You can find this in your OpenAI dashboard at https://platform.openai.com/api-keys"
      case "STRIPE_SECRET_KEY":
        return "You can find this in your Stripe dashboard under Developers > API keys"
      case "GOOGLE_CLIENT_ID":
      case "GOOGLE_CLIENT_SECRET":
        return "You can create these in the Google Cloud Console under APIs & Services > Credentials"
      case "LINKEDIN_CLIENT_ID":
      case "LINKEDIN_CLIENT_SECRET":
        return "You can create these in the LinkedIn Developer Portal"
      default:
        return ""
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Key Required</DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="credential">{getCredentialLabel()}</Label>
            <Input
              id="credential"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter your ${getCredentialLabel()}`}
            />
            {getCredentialHelp() && <p className="text-sm text-muted-foreground">{getCredentialHelp()}</p>}
            {error && (
              <div className="flex items-center text-destructive text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

