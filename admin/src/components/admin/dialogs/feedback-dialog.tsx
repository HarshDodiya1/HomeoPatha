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
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, AlertCircle, Star } from "lucide-react"
import { toast } from "sonner"
import { useFeedbacksStore } from "@/store/feedbacks.store"
import { Feedback } from "@/types/feedback"
import { cn } from "@/lib/utils"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback?: Feedback | null
  onSuccess?: () => void
}

interface FormData {
  quote: string
  userName: string
  userRole: string
  stars: number
  whatsapp: string
  instagram: string
  facebook: string
  isPublished: boolean
}

export function FeedbackDialog({ open, onOpenChange, feedback, onSuccess }: FeedbackDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { createFeedback, updateFeedback } = useFeedbacksStore()
  
  const [formData, setFormData] = useState<FormData>({
    quote: "",
    userName: "",
    userRole: "",
    stars: 5,
    whatsapp: "",
    instagram: "",
    facebook: "",
    isPublished: true,
  })

  useEffect(() => {
    if (feedback) {
      setFormData({
        quote: feedback.quote,
        userName: feedback.userName || "",
        userRole: feedback.userRole || "",
        stars: feedback.stars,
        whatsapp: feedback.socialLinks?.whatsapp || "",
        instagram: feedback.socialLinks?.instagram || "",
        facebook: feedback.socialLinks?.facebook || "",
        isPublished: feedback.isPublished,
      })
    } else {
      resetForm()
    }
  }, [feedback, open])

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
  }

  const resetForm = () => {
    setFormData({
      quote: "",
      userName: "",
      userRole: "",
      stars: 5,
      whatsapp: "",
      instagram: "",
      facebook: "",
      isPublished: true,
    })
    setError("")
  }

  const validateForm = (): string | null => {
    if (!formData.quote.trim()) {
      return "Quote/testimonial text is required"
    }
    if (formData.quote.trim().length < 10) {
      return "Quote must be at least 10 characters"
    }
    if (formData.stars < 1 || formData.stars > 5) {
      return "Rating must be between 1 and 5 stars"
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

      const feedbackData = {
        quote: formData.quote.trim(),
        userName: formData.userName.trim(),
        userRole: formData.userRole.trim(),
        stars: formData.stars,
        socialLinks: {
          whatsapp: formData.whatsapp.trim(),
          instagram: formData.instagram.trim(),
          facebook: formData.facebook.trim(),
        },
        isPublished: formData.isPublished,
      }

      if (feedback) {
        await updateFeedback(feedback._id, feedbackData)
        toast.success("Feedback updated successfully")
      } else {
        await createFeedback(feedbackData)
        toast.success("Feedback created successfully")
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      onOpenChange(false)
    }
  }

  const StarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange("stars", star)}
            className="p-1 hover:scale-110 transition-transform"
            disabled={isLoading}
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                star <= formData.stars
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {formData.stars} star{formData.stars !== 1 ? "s" : ""}
        </span>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{feedback ? "Edit Feedback" : "Add New Testimonial"}</DialogTitle>
          <DialogDescription>
            {feedback
              ? "Update the testimonial details below."
              : "Add a new customer testimonial/feedback."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Quote/Testimonial */}
            <div className="space-y-2">
              <Label htmlFor="quote">Testimonial Quote *</Label>
              <Textarea
                id="quote"
                value={formData.quote}
                onChange={(e) => handleInputChange("quote", e.target.value)}
                placeholder="Enter the customer testimonial..."
                disabled={isLoading}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters required
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating *</Label>
              <StarRating />
            </div>

            {/* User Name */}
            <div className="space-y-2">
              <Label htmlFor="userName">Customer Name</Label>
              <Input
                id="userName"
                value={formData.userName}
                onChange={(e) => handleInputChange("userName", e.target.value)}
                placeholder="Enter customer name"
                disabled={isLoading}
              />
            </div>

            {/* User Role */}
            <div className="space-y-2">
              <Label htmlFor="userRole">Customer Role/Title</Label>
              <Input
                id="userRole"
                value={formData.userRole}
                onChange={(e) => handleInputChange("userRole", e.target.value)}
                placeholder="e.g., Patient, Business Owner, Student"
                disabled={isLoading}
              />
            </div>

            {/* Social Links Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Social Links (Optional)</Label>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-xs text-muted-foreground">
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="WhatsApp number/link"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-xs text-muted-foreground">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange("instagram", e.target.value)}
                    placeholder="Instagram profile URL"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-xs text-muted-foreground">
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => handleInputChange("facebook", e.target.value)}
                    placeholder="Facebook profile URL"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Published Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isPublished" className="text-base">
                  Publish Testimonial
                </Label>
                <p className="text-sm text-muted-foreground">
                  Make this testimonial visible on the website
                </p>
              </div>
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => handleInputChange("isPublished", checked)}
                disabled={isLoading}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {feedback ? "Update Feedback" : "Add Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
