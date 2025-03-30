"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useUser, ProfileStage } from "@/contexts/user-context"
import { BasicInfoForm } from "@/components/onboarding/basic-info-form"
import { PersonalInfoForm } from "@/components/onboarding/personal-info-form"
import { CompanyInfoForm } from "@/components/onboarding/company-info-form"
import { InterestsForm } from "@/components/onboarding/interests-form"
import { ConnectionsForm } from "@/components/onboarding/connections-form"
import { CheckCircle } from "lucide-react"

export function ProgressiveOnboarding() {
  const { user, isLoading, getCurrentStage, getNextRequiredStage } = useUser()
  const [currentStage, setCurrentStage] = useState<ProfileStage>(ProfileStage.BASIC)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      const stage = getCurrentStage()
      setCurrentStage(stage)
      setIsCompleted(stage === ProfileStage.COMPLETE)
    }
  }, [isLoading, getCurrentStage])

  const handleContinue = () => {
    const nextStage = getNextRequiredStage()
    if (nextStage) {
      setCurrentStage(nextStage)
    } else {
      setIsCompleted(true)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center">Profile Complete!</CardTitle>
            <CardDescription className="text-center">
              Your profile is now complete. You can now fully use the platform.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleFinish} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const renderStageForm = () => {
    switch (currentStage) {
      case ProfileStage.BASIC:
        return <BasicInfoForm onComplete={handleContinue} />
      case ProfileStage.PERSONAL:
        return <PersonalInfoForm onComplete={handleContinue} />
      case ProfileStage.COMPANY:
        return <CompanyInfoForm onComplete={handleContinue} />
      case ProfileStage.INTERESTS:
        return <InterestsForm onComplete={handleContinue} />
      case ProfileStage.CONNECTIONS:
        return <ConnectionsForm onComplete={handleContinue} />
      default:
        return null
    }
  }

  const getStageTitle = () => {
    switch (currentStage) {
      case ProfileStage.BASIC:
        return "Basic Information"
      case ProfileStage.PERSONAL:
        return "Personal Details"
      case ProfileStage.COMPANY:
        return "Company Information"
      case ProfileStage.INTERESTS:
        return "Interests & Skills"
      case ProfileStage.CONNECTIONS:
        return "Build Your Network"
      default:
        return "Complete Your Profile"
    }
  }

  const getStageDescription = () => {
    switch (currentStage) {
      case ProfileStage.BASIC:
        return "Let's start with the basics"
      case ProfileStage.PERSONAL:
        return "Tell us more about yourself"
      case ProfileStage.COMPANY:
        return "Tell us about your company"
      case ProfileStage.INTERESTS:
        return "What are you interested in?"
      case ProfileStage.CONNECTIONS:
        return "Connect with others in your industry"
      default:
        return "Complete your profile to get the most out of the platform"
    }
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    const stages = [
      ProfileStage.BASIC,
      ProfileStage.PERSONAL,
      ProfileStage.COMPANY,
      ProfileStage.INTERESTS,
      ProfileStage.CONNECTIONS,
    ]

    const currentIndex = stages.indexOf(currentStage)
    return ((currentIndex + 1) / stages.length) * 100
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>{getStageTitle()}</CardTitle>
          <CardDescription>{getStageDescription()}</CardDescription>
          <Progress value={calculateProgress()} className="mt-2" />
        </CardHeader>
        <CardContent>{renderStageForm()}</CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

