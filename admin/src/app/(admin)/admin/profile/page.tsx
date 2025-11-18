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
import { authService } from "@/lib/services/auth.service"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, AlertCircle, CheckCircle, Mail, Phone, Calendar, Shield } from "lucide-react"
import { User } from "@/types/auth"

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [refreshing, setRefreshing] = useState(true)
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({ fullName: "", email: "", phoneNumber: "" })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  useEffect(() => {
    setMounted(true)
    const fetchUserData = async () => {
      try {
        setRefreshing(true)
        const freshUser = await authService.getCurrentUser()
        setUser(freshUser)
        setProfileForm({
          fullName: freshUser.fullName || "",
          email: freshUser.email || "",
          phoneNumber: freshUser.phoneNumber || ""
        })
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        if (authUser) {
          setUser(authUser)
          setProfileForm({
            fullName: authUser.fullName || "",
            email: authUser.email || "",
            phoneNumber: authUser.phoneNumber || ""
          })
        }
      } finally {
        setRefreshing(false)
      }
    }
    fetchUserData()
  }, [authUser])

  if (!mounted || !user || refreshing) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    setProfileError("")
    setProfileSuccess("")
    
    if (!profileForm.fullName || !profileForm.email) {
      setProfileError("Full name and email are required")
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileForm.email)) {
      setProfileError("Please enter a valid email address")
      return
    }
    
    try {
      setProfileLoading(true)
      const updateData: any = {}
      
      if (profileForm.fullName !== (user?.fullName || "")) {
        updateData.fullName = profileForm.fullName
      }
      if (profileForm.email !== (user?.email || "")) {
        updateData.email = profileForm.email
      }
      if (profileForm.phoneNumber !== (user?.phoneNumber || "")) {
        updateData.phoneNumber = profileForm.phoneNumber
      }
      
      if (Object.keys(updateData).length === 0) {
        setProfileSuccess("No changes to save")
        return
      }
      
      await authService.updateProfile(updateData)
      const freshUser = await authService.getCurrentUser()
      setUser(freshUser)
      setProfileForm({
        fullName: freshUser?.fullName || "",
        email: freshUser?.email || "",
        phoneNumber: freshUser?.phoneNumber || ""
      })
      setProfileSuccess("Profile updated successfully!")
      toast.success("Profile updated successfully!")
      setTimeout(() => setProfileSuccess(""), 3000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update profile"
      setProfileError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    setPasswordError("")
    setPasswordSuccess("")
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      setPasswordError("Please fill in all password fields")
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long")
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("Passwords do not match")
      return
    }
    
    try {
      setPasswordLoading(true)
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      })
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" })
      setPasswordSuccess("Password updated successfully!")
      toast.success("Password updated successfully!")
      setTimeout(() => setPasswordSuccess(""), 3000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update password"
      setPasswordError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setPasswordLoading(false)
    }
  }

  const getUserTypeColor = (type?: string): string => {
    if (!type) return "bg-gray-100 text-gray-800"
    const typeStr = String(type).toLowerCase()
    switch (typeStr) {
      case "superadmin": return "bg-red-100 text-red-800"
      case "doctor": return "bg-blue-100 text-blue-800"
      case "patient": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getUserInitials = (): string => {
    if (!user?.fullName) return "AD"
    return user.fullName
      .split(" ")
      .map((word: string) => word?.[0] || "")
      .filter(Boolean)
      .join("")
      .toUpperCase() || "AD"
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (e) {
      return "N/A"
    }
  }

  const getUserRoleDisplay = (): string => {
    if (!user?.role) return "User"
    return String(user.role).toUpperCase()
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3 flex-1">
              <h2 className="text-2xl font-bold">{user.fullName || "User"}</h2>
              <div className="flex flex-wrap gap-2">
                <Badge className={getUserTypeColor(user.role)}>{getUserRoleDisplay()}</Badge>
                <Badge variant={user.isActive ? "default" : "destructive"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email || "No email"}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Edit Profile</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 py-4">
              {profileSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{profileSuccess}</AlertDescription>
                </Alert>
              )}
              {profileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  disabled={profileLoading}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled={profileLoading}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  disabled={profileLoading}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setProfileForm({
                    fullName: user?.fullName || "",
                    email: user?.email || "",
                    phoneNumber: user?.phoneNumber || ""
                  })}
                  disabled={profileLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={profileLoading}>
                  {profileLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password" className="space-y-4 py-4">
              {passwordSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{passwordSuccess}</AlertDescription>
                </Alert>
              )}
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  disabled={passwordLoading}
                  placeholder="Enter current password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  disabled={passwordLoading}
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Confirm New Password
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  disabled={passwordLoading}
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" })}
                  disabled={passwordLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdatePassword} disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
