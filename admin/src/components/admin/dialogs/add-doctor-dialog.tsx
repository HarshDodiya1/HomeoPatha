"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { doctorsService } from "@/lib/services/doctors.service"

interface AddDoctorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  fullName: string
  email: string
  password: string
  phoneNumber: string
  specialization: string
  qualification: string
  experience: string
  consultationFee: string
  about: string
}

export function AddDoctorDialog({ open, onOpenChange, onSuccess }: AddDoctorDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    about: "",
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
  }

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      specialization: "",
      qualification: "",
      experience: "",
      consultationFee: "",
      about: "",
    })
    setImages([])
    setError("")
  }

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) {
      return "Full name is required"
    }
    if (!formData.email.trim()) {
      return "Email is required"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return "Invalid email format"
    }
    if (!formData.password || formData.password.length < 6) {
      return "Password must be at least 6 characters long"
    }
    if (!formData.phoneNumber.trim()) {
      return "Phone number is required"
    }
    if (!formData.specialization.trim()) {
      return "Specialization is required"
    }
    if (!formData.qualification.trim()) {
      return "Qualification is required"
    }
    if (!formData.experience) {
      return "Experience is required"
    }
    if (parseInt(formData.experience) < 0) {
      return "Experience must be a positive number"
    }
    if (!formData.consultationFee) {
      return "Consultation fee is required"
    }
    if (parseFloat(formData.consultationFee) < 0) {
      return "Consultation fee must be a positive number"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsLoading(true)
      
      const { useDoctorsStore } = await import("@/store/doctors.store")
      const { createDoctor } = useDoctorsStore.getState()
      
      await createDoctor({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        specialization: formData.specialization.trim(),
        qualification: formData.qualification.trim(),
        experience: parseInt(formData.experience),
        consultationFee: parseFloat(formData.consultationFee),
        about: formData.about.trim(),
        images,
      })
      
      toast.success("Doctor created successfully")
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create doctor"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open && !isLoading) {
        resetForm()
      }
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Doctor</DialogTitle>
          <DialogDescription>
            Create a new doctor account with professional details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Personal Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Dr. John Smith"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john.smith@hospital.com"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Min. 6 characters"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="9876543210"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Professional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                  placeholder="e.g., Cardiology, Dermatology"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification *</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange("qualification", e.target.value)}
                  placeholder="e.g., MD, MBBS, DM"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years) *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    placeholder="0"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee (₹) *</Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.consultationFee}
                    onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                    placeholder="0"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => handleInputChange("about", e.target.value)}
                  placeholder="Brief description about the doctor"
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  uploadFunction={(files) => doctorsService.uploadMultipleImages(files)}
                  label="Doctor Profile Image"
                  maxImages={1}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Doctor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
