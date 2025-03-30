"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type CredentialKey =
  | "OPENAI_API_KEY"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "NEXTAUTH_SECRET"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "LINKEDIN_CLIENT_ID"
  | "LINKEDIN_CLIENT_SECRET"

interface CredentialsContextType {
  hasCredential: (key: CredentialKey) => boolean
  getCredential: (key: CredentialKey) => string | null
  setCredential: (key: CredentialKey, value: string) => void
  requestCredential: (key: CredentialKey, reason: string) => Promise<string>
}

const CredentialsContext = createContext<CredentialsContextType | undefined>(undefined)

interface CredentialRequestModalProps {
  credentialKey: CredentialKey
  reason: string
  onSubmit: (value: string) => void
  onCancel: () => void
}

const CredentialRequestModal: React.FC<CredentialRequestModalProps> = ({
  credentialKey,
  reason,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState("")

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px" }}>
        <h2>Credential Request</h2>
        <p>
          We need your <strong>{credentialKey}</strong> to {reason}.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Enter your ${credentialKey}`}
          style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ccc",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(value)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export function CredentialsProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [pendingRequest, setPendingRequest] = useState<{
    key: CredentialKey
    reason: string
    resolve: (value: string) => void
    reject: (reason: any) => void
  } | null>(null)

  // Load credentials from localStorage on mount
  useEffect(() => {
    try {
      const savedCredentials = localStorage.getItem("app_credentials")
      if (savedCredentials) {
        setCredentials(JSON.parse(savedCredentials))
      }
    } catch (error) {
      console.error("Failed to load credentials from localStorage", error)
    }
  }, [])

  // Save credentials to localStorage when they change
  useEffect(() => {
    if (Object.keys(credentials).length > 0) {
      localStorage.setItem("app_credentials", JSON.stringify(credentials))
    }
  }, [credentials])

  const hasCredential = (key: CredentialKey): boolean => {
    return !!credentials[key]
  }

  const getCredential = (key: CredentialKey): string | null => {
    return credentials[key] || null
  }

  const setCredential = (key: CredentialKey, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const requestCredential = (key: CredentialKey, reason: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // If we already have the credential, return it immediately
      if (credentials[key]) {
        resolve(credentials[key])
        return
      }

      // Otherwise, set up a pending request
      setPendingRequest({
        key,
        reason,
        resolve,
        reject,
      })
    })
  }

  const handleSubmitCredential = (value: string) => {
    if (pendingRequest) {
      setCredential(pendingRequest.key, value)
      pendingRequest.resolve(value)
      setPendingRequest(null)
    }
  }

  const handleCancelRequest = () => {
    if (pendingRequest) {
      pendingRequest.reject(new Error("User cancelled credential request"))
      setPendingRequest(null)
    }
  }

  return (
    <CredentialsContext.Provider
      value={{
        hasCredential,
        getCredential,
        setCredential,
        requestCredential,
      }}
    >
      {children}

      {/* Credential Request Modal */}
      {pendingRequest && (
        <CredentialRequestModal
          credentialKey={pendingRequest.key}
          reason={pendingRequest.reason}
          onSubmit={handleSubmitCredential}
          onCancel={handleCancelRequest}
        />
      )}
    </CredentialsContext.Provider>
  )
}

export function useCredentials() {
  const context = useContext(CredentialsContext)
  if (context === undefined) {
    throw new Error("useCredentials must be used within a CredentialsProvider")
  }
  return context
}

