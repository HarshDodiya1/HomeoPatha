"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

export default function ProfilePage() {
  const [values, setValues] = useState({
    name: "Admin User",
    email: "admin@homeopatha.com",
    phone: "+1 555 123 4567",
  })

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Avatar</Button>
          </div>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => handleChange("name", e.currentTarget.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => handleChange("email", e.currentTarget.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={values.phone}
                onChange={(e) => handleChange("phone", e.currentTarget.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
