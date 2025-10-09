"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as React from "react"

type DoctorFormProps = {
  defaultValues?: Partial<{
    name: string
    specialization: string
    fees: string
    availability: string
    email: string
    phone: string
    imageUrl: string
  }>
  onSubmit?: (values: Record<string, string>) => void
}

export function DoctorForm({ defaultValues, onSubmit }: DoctorFormProps) {
  const [values, setValues] = React.useState<Record<string, string>>({
    name: defaultValues?.name || "",
    specialization: defaultValues?.specialization || "",
    fees: defaultValues?.fees || "",
    availability: defaultValues?.availability || "",
    email: defaultValues?.email || "",
    phone: defaultValues?.phone || "",
    imageUrl: defaultValues?.imageUrl || "",
  })

  function handleChange(key: string, val: string) {
    setValues((p) => ({ ...p, [key]: val }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Doctor Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => handleChange("name", e.currentTarget.value)}
            placeholder="Dr. Jane Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Select value={values.specialization} onValueChange={(v) => handleChange("specialization", v)}>
            <SelectTrigger id="specialization">
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="dermatology">Dermatology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fees">Fees</Label>
          <Input
            id="fees"
            type="number"
            value={values.fees}
            onChange={(e) => handleChange("fees", e.currentTarget.value)}
            placeholder="100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Input
            id="availability"
            value={values.availability}
            onChange={(e) => handleChange("availability", e.currentTarget.value)}
            placeholder="Mon-Fri 9:00 - 17:00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.currentTarget.value)}
            placeholder="doctor@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={values.phone}
            onChange={(e) => handleChange("phone", e.currentTarget.value)}
            placeholder="+1 555 123 4567"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="image">Image Upload</Label>
          <Input id="image" type="file" onChange={(e) => handleChange("imageUrl", e.currentTarget.value)} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="button" onClick={() => onSubmit?.(values)}>
          Save
        </Button>
      </CardFooter>
    </Card>
  )
}
