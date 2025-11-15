"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/store/auth.store"

export default function LoginPage() {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isInitialized, setIsInitialized] = React.useState(false)
  const { isLoading, error } = useAuth()
  const router = useRouter()
  const { isAuthenticated, isInitialized: storeInitialized, login } = useAuthStore()

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
      toast.error("Please enter your username")
      return
    }
    
    if (!password) {
      toast.error("Please enter your password")
      return
    }

    try {
      await login({ username, password })
      toast.success("Login successful!")
      // Redirect after successful login
      setTimeout(() => {
        router.push('/admin')
      }, 500)
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.detail || err.message || "Login failed"
      toast.error(errorMessage)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  // Show loading while auth store is initializing
  if (!isInitialized) {
    return (
      <main className="flex min-h-svh items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
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
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
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
                onKeyPress={handleKeyPress}
                placeholder="Enter your username"
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}
