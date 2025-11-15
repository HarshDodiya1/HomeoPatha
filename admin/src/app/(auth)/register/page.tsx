"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserTypeEnum } from "@/types/auth"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export default function RegisterPage() {
  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [role, setRole] = React.useState<UserTypeEnum>(UserTypeEnum.ADMIN)
  const [isInitialized, setIsInitialized] = React.useState(false)
  
  const router = useRouter()
  const { register, isLoading, error, isAuthenticated, isInitialized: storeInitialized } = useAuthStore()

  // Check if already authenticated and redirect once
  React.useEffect(() => {
    // Wait for store to be initialized
    if (!storeInitialized) {
      return
    }

    setIsInitialized(true)

    // If already authenticated, redirect to admin
    if (isAuthenticated) {
      router.push('/admin')
    }
  }, [storeInitialized, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!username.trim()) {
      toast.error("Please enter a username")
      return
    }
    
    if (!email.trim()) {
      toast.error("Please enter an email")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }
    
    if (!password) {
      toast.error("Please enter a password")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!phone.trim()) {
      toast.error("Please enter a phone number")
      return
    }

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
      })
      
      toast.success("Registration successful! Redirecting...")
      setTimeout(() => {
        router.push('/admin')
      }, 500)
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMessage = err.response?.data?.detail || err.message || "Registration failed"
      toast.error(errorMessage)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Admin Account</CardTitle>
          <CardDescription>
            Fill in the details to create a new admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                placeholder="Enter username"
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.currentTarget.value)}
                placeholder="+1234567890"
                disabled={isLoading}
                autoComplete="tel"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserTypeEnum)}
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserTypeEnum.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserTypeEnum.DOCTOR}>Doctor</SelectItem>
                  <SelectItem value={UserTypeEnum.PATIENT}>Patient</SelectItem>
                  <SelectItem value={UserTypeEnum.RIDER}>Rider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="Enter password (min 6 characters)"
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                placeholder="Re-enter password"
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}
