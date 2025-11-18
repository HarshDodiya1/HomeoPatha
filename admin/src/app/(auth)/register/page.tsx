"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export default function RegisterPage() {
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [validationErrors, setValidationErrors] = React.useState<{ [key: string]: string }>({})
  
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
    setValidationErrors({})
    
    // Validation
    if (!fullName.trim()) {
      toast.error("Please enter your full name")
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

    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number")
      return
    }

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        phoneNumber: phoneNumber.trim(),
      })
      
      toast.success("Registration successful! Redirecting...")
      setTimeout(() => {
        router.push('/admin')
      }, 500)
    } catch (err: any) {
      console.error('Registration error:', err)
      
      // Handle validation errors from backend
      if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
        setValidationErrors(err.response.data.errors)
        const firstError = Object.values(err.response.data.errors)[0]
        toast.error(firstError as string)
      } else {
        const errorMessage = err.response?.data?.message || err.message || "Registration failed"
        toast.error(errorMessage)
      }
    }
  }

  if (!isInitialized) {
    return (
      <main className="flex min-h-svh items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Initializing...
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Fill in the details to create a new account
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.currentTarget.value)}
                placeholder="Enter your full name"
                disabled={isLoading}
                autoComplete="name"
                required
                className={validationErrors.fullName ? "border-red-500" : ""}
              />
              {validationErrors.fullName && (
                <p className="text-sm text-red-500">{validationErrors.fullName}</p>
              )}
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
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                placeholder="9876543210"
                disabled={isLoading}
                autoComplete="tel"
                required
                className={validationErrors.phoneNumber ? "border-red-500" : ""}
              />
              {validationErrors.phoneNumber && (
                <p className="text-sm text-red-500">{validationErrors.phoneNumber}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="Enter password (min 8 characters, uppercase, lowercase, number)"
                disabled={isLoading}
                autoComplete="new-password"
                required
                className={validationErrors.password ? "border-red-500" : ""}
              />
              {validationErrors.password && (
                <p className="text-sm text-red-500">{validationErrors.password}</p>
              )}
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
                className={validationErrors.confirmPassword ? "border-red-500" : ""}
              />
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
              )}
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
