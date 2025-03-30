"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useServiceCredentials } from "@/hooks/use-service-credentials"

interface VisibilityOption {
  id: string
  label: string
  description: string
  enabled: boolean
}

export function ProfileVisibility() {
  const { toast } = useToast()
  const { requestCredentials } = useServiceCredentials()

  const [visibilityOptions, setVisibilityOptions] = useState<VisibilityOption[]>([
    {
      id: "profile",
      label: "Profile Visibility",
      description: "Make your profile visible to all users on the platform",
      enabled: true,
    },
    {
      id: "contact",
      label: "Contact Information",
      description: "Show your email and phone number to your connections",
      enabled: true,
    },
    {
      id: "experience",
      label: "Work Experience",
      description: "Display your work history and current position",
      enabled: true,
    },
    {
      id: "education",
      label: "Education",
      description: "Show your educational background",
      enabled: true,
    },
    {
      id: "skills",
      label: "Skills & Endorsements",
      description: "Display your skills and allow endorsements",
      enabled: true,
    },
    {
      id: "connections",
      label: "Connections",
      description: "Allow others to see your network connections",
      enabled: false,
    },
    {
      id: "activity",
      label: "Activity & Posts",
      description: "Show your recent activities and posts in others' feeds",
      enabled: true,
    },
  ])

  const handleToggle = async (id: string) => {
    try {
      await requestCredentials("database")

      setVisibilityOptions((prev) =>
        prev.map((option) => (option.id === id ? { ...option, enabled: !option.enabled } : option)),
      )

      toast({
        title: "Settings updated",
        description: "Your visibility preferences have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveAll = async () => {
    try {
      await requestCredentials("database")

      toast({
        title: "Settings saved",
        description: "All visibility settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Visibility</CardTitle>
        <CardDescription>Control what information is visible to other users on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visibilityOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={option.id}>{option.label}</Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <Switch id={option.id} checked={option.enabled} onCheckedChange={() => handleToggle(option.id)} />
            </div>
          ))}

          <div className="pt-4">
            <Button onClick={handleSaveAll}>Save All Settings</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

