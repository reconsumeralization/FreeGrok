"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useServiceCredentials } from "@/hooks/use-service-credentials"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  company: z.string().optional(),
  location: z.string().optional(),
  about: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  skills: z.array(z.string()),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url({ message: "Please enter a valid URL." }),
    }),
  ),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string().optional().or(z.literal("")),
      description: z.string().optional(),
    }),
  ),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      startYear: z.string(),
      endYear: z.string().optional().or(z.literal("")),
    }),
  ),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This would normally come from your database
const defaultValues: ProfileFormValues = {
  name: "John Doe",
  title: "Senior Product Manager",
  company: "Tech Innovations Inc.",
  location: "San Francisco, CA",
  about:
    "Product leader with 10+ years of experience in SaaS and B2B products. Passionate about creating solutions that solve real business problems and drive growth.",
  website: "https://johndoe.com",
  skills: [
    "Product Management",
    "Product Strategy",
    "User Experience",
    "Market Research",
    "Agile Methodologies",
    "Data Analysis",
    "Team Leadership",
    "B2B SaaS",
    "Product Development",
  ],
  socialLinks: [
    {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/johndoe",
    },
    {
      platform: "Twitter",
      url: "https://twitter.com/johndoe",
    },
  ],
  experience: [
    {
      title: "Senior Product Manager",
      company: "Tech Innovations Inc.",
      startDate: "2020-01",
      endDate: "",
      description:
        "Leading product strategy and development for B2B SaaS platform. Increased user engagement by 45% and reduced churn by 20%.",
    },
    {
      title: "Product Manager",
      company: "Software Solutions Ltd.",
      startDate: "2017-03",
      endDate: "2019-12",
      description: "Managed the development and launch of 3 major product features that increased revenue by 30%.",
    },
  ],
  education: [
    {
      school: "Stanford University",
      degree: "MBA",
      field: "Business Administration",
      startYear: "2015",
      endYear: "2017",
    },
    {
      school: "University of California, Berkeley",
      degree: "BS",
      field: "Computer Science",
      startYear: "2011",
      endYear: "2015",
    },
  ],
}

export default function EditProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const { requestCredentials } = useServiceCredentials()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSubmitting(true)
      await requestCredentials("database")

      // In a real app, you would save this data to your database
      console.log(data)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.push("/profile/johndoe")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">Update your professional information and preferences</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Product Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself and your professional background"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormDescription>Your personal or professional website</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add your professional skills and expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {form.watch("skills").map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`skills.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Skill" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const currentSkills = form.getValues("skills")
                        form.setValue(
                          "skills",
                          currentSkills.filter((_, i) => i !== index),
                        )
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const currentSkills = form.getValues("skills")
                    form.setValue("skills", [...currentSkills, ""])
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Add your social media profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {form.watch("socialLinks").map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.platform`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <FormControl>
                            <Input placeholder="LinkedIn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>URL</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl className="flex-1">
                              <Input placeholder="https://linkedin.com/in/username" {...field} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const currentLinks = form.getValues("socialLinks")
                                form.setValue(
                                  "socialLinks",
                                  currentLinks.filter((_, i) => i !== index),
                                )
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const currentLinks = form.getValues("socialLinks")
                    form.setValue("socialLinks", [...currentLinks, { platform: "", url: "" }])
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Social Link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
              <CardDescription>Add your work experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {form.watch("experience").map((_, index) => (
                  <div key={index} className="space-y-4">
                    {index > 0 && <Separator className="my-6" />}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`experience.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Product Manager" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`experience.${index}.company`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Company Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`experience.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`experience.${index}.endDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="month" placeholder="Leave blank if current" {...field} />
                            </FormControl>
                            <FormDescription>Leave blank if this is your current position</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`experience.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your responsibilities and achievements"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentExperience = form.getValues("experience")
                        form.setValue(
                          "experience",
                          currentExperience.filter((_, i) => i !== index),
                        )
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Experience
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const currentExperience = form.getValues("experience")
                    form.setValue("experience", [
                      ...currentExperience,
                      { title: "", company: "", startDate: "", endDate: "", description: "" },
                    ])
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Experience
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Add your educational background</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {form.watch("education").map((_, index) => (
                  <div key={index} className="space-y-4">
                    {index > 0 && <Separator className="my-6" />}

                    <FormField
                      control={form.control}
                      name={`education.${index}.school`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School/University</FormLabel>
                          <FormControl>
                            <Input placeholder="University Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`education.${index}.degree`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Degree</FormLabel>
                            <FormControl>
                              <Input placeholder="Bachelor's, Master's, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`education.${index}.field`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field of Study</FormLabel>
                            <FormControl>
                              <Input placeholder="Computer Science, Business, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`education.${index}.startYear`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Year</FormLabel>
                            <FormControl>
                              <Input placeholder="2015" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`education.${index}.endYear`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Year</FormLabel>
                            <FormControl>
                              <Input placeholder="2019" {...field} />
                            </FormControl>
                            <FormDescription>Leave blank if currently studying</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentEducation = form.getValues("education")
                        form.setValue(
                          "education",
                          currentEducation.filter((_, i) => i !== index),
                        )
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Education
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const currentEducation = form.getValues("education")
                    form.setValue("education", [
                      ...currentEducation,
                      { school: "", degree: "", field: "", startYear: "", endYear: "" },
                    ])
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Education
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/profile/johndoe")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

