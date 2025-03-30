"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser } from "@/contexts/user-context"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"

interface CompanyInfoFormProps {
  onComplete: () => void
}

export function CompanyInfoForm({ onComplete }: CompanyInfoFormProps) {
  const { user, updateProfile } = useUser()
  const [formData, setFormData] = useState({
    name: user?.company?.name || '',
    industry: user?.company?.industry || '',
    size: user?.company?.size || '',
    website: user?.company?.website || '',
    logo: user?.company?.logo || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(user?.company?.logo || null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'File size must be less than 5MB' }))
      return
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {\
      setErrors(prev => (...prev, logo:  'image/png\', \'image/svg+xml\'].includes(file.type)) {
      setErrors(prev => ({ ...prev, logo: 'File must be JPEG, PNG, or SVG' }))
      return
    
    // Create a preview URL
    const url = URL.createObjectURL(file)
    setLogoPreview(url)
    
    // In a real app, you would upload the file to a server and get a URL back
    // For this example, we'll just use the preview URL
    setFormData(prev => ({ ...prev, logo: url }))
    
    // Clear error
    if (errors.logo) {
      setErrors(prev => ({ ...prev, logo: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Industry is required'
    }
    
    if (!formData.website.trim()) {
      newErrors.website = 'Website is required'
    } else if (!/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(formData.website)) {
      newErrors.website = 'Website URL is invalid'
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
        company: {
          name: formData.name,
          industry: formData.industry,
          size: formData.size,
          website: formData.website,
          logo: formData.logo
        }
      })
      
      onComplete()
    } catch (error) {
      console.error('Error updating company info:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Acme Corporation"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Select
          value={formData.industry}
          onValueChange={(value) => handleSelectChange('industry', value)}
        >
          <SelectTrigger id="industry">
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="consulting">Consulting</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.industry && <p className="text-sm text-destructive">{errors.industry}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="size">Company Size</Label>
        <Select
          value={formData.size}
          onValueChange={(value) => handleSelectChange('size', value)}
        >
          <SelectTrigger id="size">
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-500">201-500 employees</SelectItem>
            <SelectItem value="501-1000">501-1000 employees</SelectItem>
            <SelectItem value="1001+">1001+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Company Website</Label>
        <Input
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://example.com"
        />
        {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="logo">Company Logo</Label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <div className="relative h-16 w-16 rounded overflow-hidden">
              <Image
                src={logoPreview || "/placeholder.svg"}
                alt="Logo preview"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG or SVG. Max 5MB.
            </p>
          </div>
        </div>
        {errors.logo && (
          <p className="text-sm text-destructive">{errors.logo}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </form>
  )
}

