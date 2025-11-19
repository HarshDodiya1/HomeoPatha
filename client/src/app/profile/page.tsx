"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, User as UserIcon, Mail, Phone, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized, initialize, updateProfile, logout, isLoading } = useAuthStore()

  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "")
      setPhoneNumber(user.phoneNumber || "")
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim()) {
      toast.error("Please enter your full name")
      return
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number")
      return
    }

    try {
      setIsUpdating(true)
      await updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      })
      toast.success("Profile updated successfully!")
    } catch (err: any) {
      console.error('Update profile error:', err)
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      router.push('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details here</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isUpdating}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Read-only)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isUpdating}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role (Read-only)</Label>
                  <Input
                    id="role"
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFullName(user.fullName || "")
                    setPhoneNumber(user.phoneNumber || "")
                  }}
                  disabled={isUpdating}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Created:</span>
              <span className="font-medium">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
