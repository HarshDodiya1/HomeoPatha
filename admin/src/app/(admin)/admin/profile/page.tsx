"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useUsersStore } from "@/store/users.store"
import { authService } from "@/lib/services/auth.service"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { User } from "@/types/auth"

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { updateUser: updateUserInStore, error: storeError, clearError } = useUsersStore()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [refreshing, setRefreshing] = useState(true)
  const [formData, setFormData] = useState({ username: "", email: "" })
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [formattedDates, setFormattedDates] = useState({ memberSince: "", lastUpdated: "" })

  useEffect(() => {
    setMounted(true)
    const fetchUserData = async () => {
      try {
        setRefreshing(true)
        const freshUser = await authService.getCurrentUser()
        setUser(freshUser)
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        if (authUser) {
          setUser(authUser)
        }
      } finally {
        setRefreshing(false)
      }
    }
    fetchUserData()
  }, [authUser])

  useEffect(() => {
    if (user && mounted) {
      setFormData({ username: user.username, email: user.email })
      const memberDate = new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const updatedDate = new Date(user.updated_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      setFormattedDates({ memberSince: memberDate, lastUpdated: updatedDate })
    }
  }, [user, mounted])

  if (!mounted || !user || refreshing) {
    return <div className="flex items-center justify-center py-8"><p className="text-muted-foreground">Loading profile...</p></div>
  }

  const handleSaveProfile = async () => {
    if (!formData.username || !formData.email) {
      toast.error("Username and email are required")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }
    try {
      setIsLoading(true)
      setSuccessMessage("")
      clearError()
      const updateData: any = {}
      if (formData.username !== user.username) {
        updateData.username = formData.username
      }
      if (formData.email !== user.email) {
        updateData.email = formData.email
      }
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save")
        return
      }
      await updateUserInStore(user.id, updateData)
      const freshUser = await authService.getCurrentUser()
      setUser(freshUser)
      setSuccessMessage("Profile updated successfully!")
      toast.success("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update profile"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    try {
      setIsLoading(true)
      setSuccessMessage("")
      clearError()
      await updateUserInStore(user.id, { password: passwordForm.newPassword })
      setPasswordForm({ newPassword: "", confirmPassword: "" })
      const freshUser = await authService.getCurrentUser()
      setUser(freshUser)
      setSuccessMessage("Password updated successfully!")
      toast.success("Password updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update password"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "ADMIN": return "bg-red-100 text-red-800"
      case "DOCTOR": return "bg-blue-100 text-blue-800"
      case "PATIENT": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getUserInitials = () => {
    return user.username.split(" ").map((word: string) => word[0]).join("").toUpperCase()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg font-semibold">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <div className="flex gap-2">
                <Badge className={getUserTypeColor(user.user_type)}>{user.user_type}</Badge>
                <Badge variant={user.is_active ? "default" : "destructive"}>{user.is_active ? "Active" : "Inactive"}</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{formattedDates.memberSince}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formattedDates.lastUpdated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 py-4">
              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                </Alert>
              )}
              {storeError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{storeError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: (e.target as HTMLInputElement).value }))}
                  disabled={isLoading}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: (e.target as HTMLInputElement).value }))}
                  disabled={isLoading}
                  placeholder="Enter email"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setFormData({ username: user.username, email: user.email })}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="password" className="space-y-4 py-4">
              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                </Alert>
              )}
              {storeError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{storeError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: (e.target as HTMLInputElement).value }))}
                  disabled={isLoading}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: (e.target as HTMLInputElement).value }))}
                  disabled={isLoading}
                  placeholder="Confirm password"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPasswordForm({ newPassword: "", confirmPassword: "" })}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdatePassword} disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Password"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
