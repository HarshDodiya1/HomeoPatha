"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, Mail, Lock, Sparkles, Leaf, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)
  
  const router = useRouter()
  const { login, isLoading, error, isAuthenticated, isInitialized: storeInitialized, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!storeInitialized) {
      return
    }

    setIsInitialized(true)

    if (isAuthenticated) {
      router.push('/')
    }
  }, [storeInitialized, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error("Please enter your email")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }
    
    if (!password) {
      toast.error("Please enter your password")
      return
    }

    try {
      await login({
        email: email.trim(),
        password,
      })
      
      toast.success("Login successful!")
      router.push('/')
    } catch (err: any) {
      console.error('Login error:', err)
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-30">
            <Loader2 className="h-10 w-10 text-primary" />
          </div>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 pt-24">
      {/* Premium background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.08),transparent_60%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(22,163,74,0.08),transparent_60%)] -z-10" />
      
      {/* Floating decorative elements */}
      <div className="fixed top-40 right-20 w-3 h-3 rounded-full bg-primary/30 animate-bounce pointer-events-none" style={{ animationDelay: '0s' }} />
      <div className="fixed top-72 left-16 w-2 h-2 rounded-full bg-accent/30 animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }} />
      <div className="fixed bottom-40 right-1/4 w-2 h-2 rounded-full bg-primary/20 animate-bounce pointer-events-none" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[28px] blur-lg opacity-50" />
          <Card className="relative rounded-3xl border-border/50 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader className="space-y-1 pt-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 px-8">
                {error && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-16 h-14 rounded-xl border-border/50 focus:border-primary/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-primary" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-16 h-14 rounded-xl border-border/50 focus:border-primary/50"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-full shadow-lg shadow-primary/25" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline font-semibold">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
