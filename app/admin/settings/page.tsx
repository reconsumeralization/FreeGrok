"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "BizConnect",
    siteDescription: "B2B Social Networking Platform",
    contactEmail: "support@bizconnect.com",
    maxUploadSize: "10",
    maintenanceMode: false,
  })
  
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: "8",
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    twoFactorAuthEnabled: true,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
  })
  
  const [contentSettings, setContentSettings] = useState({
    autoModeration: true,
    profanityFilter: true,
    allowUserUploads: true,
    maxPostLength: "5000",
    maxCommentLength: "1000",
    allowedFileTypes: "jpg,jpeg,png,gif,pdf,doc,docx",
  })
  
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target
    setGeneralSettings({
      ...generalSettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }
  
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target
    setSecuritySettings({
      ...securitySettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }
  
  const handleContentChange = (e) => {
    const { name, value, type, checked } = e.target
    setContentSettings({
      ...contentSettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }
  
  const handleSaveSettings = async (settingsType) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast({
        title: "Settings saved",
        description: `${settingsType} settings have been updated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  name="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={handleGeneralChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxUploadSize">Maximum Upload Size (MB)</Label>
                <Input
                  id="maxUploadSize"
                  name="maxUploadSize"
                  type="number"
                  value={generalSettings.maxUploadSize}
                  onChange={handleGeneralChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      maintenanceMode: checked,
                    })
                  }
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSaveSettings("General")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure platform security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  name="passwordMinLength"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={handleSecurityChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="passwordRequireUppercase"
                  name="passwordRequireUppercase"
                  checked={securitySettings.passwordRequireUppercase}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordRequireUppercase: checked,
                    })
                  }
                />
                <Label htmlFor="passwordRequireUppercase">Require Uppercase Letters</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="passwordRequireNumbers"
                  name="passwordRequireNumbers"
                  checked={securitySettings.passwordRequireNumbers}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordRequireNumbers: checked,
                    })
                  }
                />
                <Label htmlFor="passwordRequireNumbers">Require Numbers</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="passwordRequireSymbols"
                  name="passwordRequireSymbols"
                  checked={securitySettings.passwordRequireSymbols}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordRequireSymbols: checked,
                    })
                  }
                />
                <Label htmlFor="passwordRequireSymbols">Require Symbols</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactorAuthEnabled"
                  name="twoFactorAuthEnabled"
                  checked={securitySettings.twoFactorAuthEnabled}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({
                      ...securitySettings,
                      twoFactorAuthEnabled: checked,
                    })
                  }
                />
                <Label htmlFor="twoFactorAuthEnabled">Enable Two-Factor Authentication</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (days)</Label>
                <Input
                  id="sessionTimeout"
                  name="sessionTimeout"\

