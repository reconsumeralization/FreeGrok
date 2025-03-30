"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/contexts/user-context"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"

interface PersonalInfoFormProps {
  onComplete: () => void
}

export function PersonalInfoForm({ onComplete }: PersonalInfoFormProps) {
  const { user, updateProfile } = useUser()
  const [formData, setFormData] = useState({
    jobTitle: user?.jobTitle || "",
    bio: user?.bio || "",
    profilePicture: user?.profilePicture || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePicture || null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profilePicture: "File size must be less than 5MB" }))
      return
    }

    // Check file type
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, profilePicture: "File must be JPEG, PNG, or GIF" }))
      return
    }

    // Create a preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // In a real app, you would upload the file to a server and get a URL back
    // For this example, we'll just use the preview URL
    setFormData((prev) => ({ ...prev, profilePicture: url }))

    // Clear error
    if (errors.profilePicture) {
      setErrors((prev) => ({ ...prev, profilePicture: "" }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required"
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required"
    } else if (formData.bio.length < 10) {
      newErrors.bio = "Bio must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      await updateProfile({
        jobTitle: formData.jobTitle,
        bio: formData.bio,
        profilePicture: formData.profilePicture,
      })

      onComplete()
    } catch (error) {
      console.error("Error updating personal info:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          placeholder="CEO, Marketing Director, etc."
        />
        {errors.jobTitle && <p className="text-sm text-destructive">{errors.jobTitle}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about your professional background and expertise..."
          rows={4}
        />
        {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profilePicture">Profile Picture</Label>
        <div className="flex items-center gap-4">
          {previewUrl ? (
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <Image src={previewUrl || "/placeholder.svg"} alt="Profile preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <Input
              id="profilePicture"
              name="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">JPEG, PNG or GIF. Max 5MB.</p>
          </div>
        </div>
        {errors.profilePicture && <p className="text-sm text-destructive">{errors.profilePicture}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  )
}

