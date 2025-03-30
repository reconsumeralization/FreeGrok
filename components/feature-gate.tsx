"use client"

import { type ReactNode, useState } from "react"
import { useUser, ProfileStage } from "@/contexts/user-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface FeatureGateProps {
  children: ReactNode
  requiredStage: ProfileStage
  title?: string
  description?: string
}

export function FeatureGate({
  children,
  requiredStage,
  title = "Profile Completion Required",
  description = "Please complete your profile to access this feature.",
}: FeatureGateProps) {
  const { user, getCurrentStage } = useUser()
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()

  // Check if the user has completed the required stage
  const currentStage = getCurrentStage()
  const stages = [
    ProfileStage.BASIC,
    ProfileStage.PERSONAL,
    ProfileStage.COMPANY,
    ProfileStage.INTERESTS,
    ProfileStage.CONNECTIONS,
    ProfileStage.COMPLETE,
  ]

  const currentIndex = stages.indexOf(currentStage)
  const requiredIndex = stages.indexOf(requiredStage)

  const hasRequiredStage = currentIndex >= requiredIndex

  // If the user has completed the required stage, render the children
  if (hasRequiredStage) {
    return <>{children}</>
  }

  // Otherwise, render a placeholder that shows the dialog when clicked
  return (
    <>
      <div className="relative cursor-pointer" onClick={() => setShowDialog(true)}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Button variant="outline" onClick={() => setShowDialog(true)}>
            Complete Profile to Unlock
          </Button>
        </div>
        <div className="opacity-50 pointer-events-none">{children}</div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">You need to complete the following profile sections:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              {stages.slice(requiredIndex, currentIndex + 1).map((stage) => (
                <li key={stage}>
                  {stage === ProfileStage.BASIC
                    ? "Basic Information"
                    : stage === ProfileStage.PERSONAL
                      ? "Personal Details"
                      : stage === ProfileStage.COMPANY
                        ? "Company Information"
                        : stage === ProfileStage.INTERESTS
                          ? "Interests & Skills"
                          : stage === ProfileStage.CONNECTIONS
                            ? "Connections"
                            : "Complete Profile"}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Later
            </Button>
            <Button onClick={() => router.push("/profile/edit")}>Complete Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

