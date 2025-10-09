"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import * as React from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to reset your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="you@example.com"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full">Send Reset Link</Button>
          <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
