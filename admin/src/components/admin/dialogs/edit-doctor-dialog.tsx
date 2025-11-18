"use client"

import { useState, useEffect } from "react"
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

interface EditDoctorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor?: any
  onSuccess?: () => void
}

export function EditDoctorDialog({ open, onOpenChange, doctor, onSuccess }: EditDoctorDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    about: "",
  })

  useEffect(() => {
    if (doctor && open) {
      setFormData({
        fullName: doctor.userId?.fullName || doctor.user?.fullName || "",
        email: doctor.userId?.email || doctor.user?.email || "",
        phoneNumber: doctor.userId?.phoneNumber || doctor.user?.phoneNumber || "",
        specialization: doctor.specialization || "",
        qualification: doctor.qualification || "",
        experience: doctor.experience?.toString() || "",
        consultationFee: doctor.consultationFee?.toString() || "",
        about: doctor.about || "",
      })
      setError("")
    }
  }, [doctor, open])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    setError("")

    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format")
      return
    }

    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required")
      return
    }

    if (!formData.specialization.trim()) {
      setError("Specialization is required")
      return
    }

    if (!formData.qualification.trim()) {
      setError("Qualification is required")
      return
    }

    if (!formData.experience) {
      setError("Experience is required")
      return
    }

    if (parseInt(formData.experience) < 0) {
      setError("Experience must be a positive number")
      return
    }

    if (!formData.consultationFee) {
      setError("Consultation fee is required")
      return
    }

    if (parseFloat(formData.consultationFee) < 0) {
      setError("Consultation fee must be a positive number")
      return
    }

    try {
      setIsLoading(true)
      const { useDoctorsStore } = await import("@/store/doctors.store")
      const { updateDoctor } = useDoctorsStore.getState()
      
      const doctorId = doctor?.id || doctor?._id
      if (!doctorId) {
        throw new Error("Doctor ID not found")
      }

      await updateDoctor(doctorId, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        specialization: formData.specialization.trim(),
        qualification: formData.qualification.trim(),
        experience: parseInt(formData.experience),
        consultationFee: parseFloat(formData.consultationFee),
        about: formData.about.trim(),
      })
      
      toast.success("Doctor updated successfully")
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update doctor"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
          <DialogDescription>
            Update doctor personal and professional information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Personal Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Dr. John Smith"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john.smith@hospital.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="9876543210"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Professional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => handleInputChange("specialization", e.target.value)}
                placeholder="e.g., Cardiology"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange("qualification", e.target.value)}
                placeholder="e.g., MD, MBBS"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="0"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.consultationFee}
                  onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                  placeholder="0"
                  disabled={isLoading}
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
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
