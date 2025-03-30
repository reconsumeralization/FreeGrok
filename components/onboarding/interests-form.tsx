"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useUser } from "@/contexts/user-context"
import { Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface InterestsFormProps {
  onComplete: () => void
}

export function InterestsForm({ onComplete }: InterestsFormProps) {
  const { user, updateProfile } = useUser()
  const [interests, setInterests] = useState<string[]>(user?.interests || [])
  const [skills, setSkills] = useState<string[]>(user?.skills || [])
  const [newInterest, setNewInterest] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddInterest = () => {
    if (!newInterest.trim()) return

    // Check if interest already exists
    if (interests.includes(newInterest.trim())) {
      setErrors((prev) => ({ ...prev, interests: "This interest already exists" }))
      return
    }

    setInterests((prev) => [...prev, newInterest.trim()])
    setNewInterest("")

    // Clear error
    if (errors.interests) {
      setErrors((prev) => ({ ...prev, interests: "" }))
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setInterests((prev) => prev.filter((i) => i !== interest))
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) return

    // Check if skill already exists
    if (skills.includes(newSkill.trim())) {
      setErrors((prev) => ({ ...prev, skills: "This skill already exists" }))
      return
    }

    setSkills((prev) => [...prev, newSkill.trim()])
    setNewSkill("")

    // Clear error
    if (errors.skills) {
      setErrors((prev) => ({ ...prev, skills: "" }))
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (interests.length === 0) {
      newErrors.interests = "At least one interest is required"
    }

    if (skills.length === 0) {
      newErrors.skills = "At least one skill is required"
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
        interests,
        skills,
      })

      onComplete()
    } catch (error) {
      console.error("Error updating interests and skills:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="interests">Professional Interests</Label>
        <div className="flex gap-2">
          <Input
            id="interests"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            placeholder="Add an interest (e.g., Digital Marketing)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddInterest()
              }
            }}
          />
          <Button type="button" onClick={handleAddInterest}>
            Add
          </Button>
        </div>
        {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}

        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map((interest, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
            >
              {interest}
              <button
                type="button"
                onClick={() => handleRemoveInterest(interest)}
                className="text-primary hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Professional Skills</Label>
        <div className="flex gap-2">
          <Input
            id="skills"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g., Project Management)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddSkill()
              }
            }}
          />
          <Button type="button" onClick={handleAddSkill}>
            Add
          </Button>
        </div>
        {errors.skills && <p className="text-sm text-destructive">{errors.skills}</p>}

        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-secondary-foreground hover:text-secondary-foreground/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
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

