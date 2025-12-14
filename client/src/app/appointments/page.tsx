"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Search,
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  IndianRupee,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Footer } from "@/components/footer"
import { useAuthStore } from "@/store/auth.store"
import { specializationService } from "@/lib/services/specialization.service"
import { appointmentService } from "@/lib/services/appointment.service"
import { Specialization, AppointmentQuestion } from "@/types/specialization"
import Script from "next/script"

type BookingStep = "select" | "questions" | "payment" | "success"

export default function AppointmentsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized, initialize } = useAuthStore()

  // Step management
  const [currentStep, setCurrentStep] = useState<BookingStep>("select")
  
  // Specializations
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [isLoadingSpecializations, setIsLoadingSpecializations] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Selected specialization and questions
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null)
  const [questions, setQuestions] = useState<AppointmentQuestion[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  
  // Form answers
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Payment
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    fetchSpecializations()
  }, [])

  const fetchSpecializations = async () => {
    setIsLoadingSpecializations(true)
    try {
      const response = await specializationService.getSpecializations({ limit: 50 })
      setSpecializations(response.data.specializations)
    } catch (error: any) {
      console.error("Failed to fetch specializations:", error)
      toast.error("Failed to load specializations")
    } finally {
      setIsLoadingSpecializations(false)
    }
  }

  const handleSelectSpecialization = async (specialization: Specialization) => {
    if (!isAuthenticated) {
      toast.error("Please login to book an appointment")
      router.push("/login?redirect=/appointments")
      return
    }

    setSelectedSpecialization(specialization)
    setIsLoadingQuestions(true)
    setAnswers({})
    setFormErrors({})

    try {
      const response = await specializationService.getSpecializationWithQuestions(specialization._id)
      setQuestions(response.data.questions)
      setCurrentStep("questions")
    } catch (error: any) {
      console.error("Failed to fetch questions:", error)
      toast.error("Failed to load booking form")
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Clear error when user starts typing
    if (formErrors[questionId]) {
      setFormErrors((prev) => {
        const updated = { ...prev }
        delete updated[questionId]
        return updated
      })
    }
  }

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentValues = (prev[questionId] as string[]) || []
      if (checked) {
        return { ...prev, [questionId]: [...currentValues, option] }
      } else {
        return { ...prev, [questionId]: currentValues.filter((v) => v !== option) }
      }
    })
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    questions.forEach((q) => {
      if (q.isRequired) {
        const answer = answers[q._id]
        if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === "string" && !answer.trim())) {
          errors[q._id] = "This field is required"
        }
      }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProceedToPayment = () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }
    setCurrentStep("payment")
  }

  const handlePayment = async () => {
    if (!selectedSpecialization || !user) return

    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please try again.")
      return
    }

    setIsProcessingPayment(true)

    try {
      // Prepare question responses
      const questionResponses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }))

      // Create order
      const orderResponse = await appointmentService.createAppointmentOrder({
        specializationId: selectedSpecialization._id,
        questionResponses,
      })

      const { appointmentId: newAppointmentId, orderId, amount, currency, keyId } = orderResponse.data

      // Initialize Razorpay
      const options = {
        key: keyId,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        name: "HomeoPatha",
        description: `Consultation - ${selectedSpecialization.name}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            await appointmentService.verifyPayment({
              appointmentId: newAppointmentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            setAppointmentId(newAppointmentId)
            setBookingSuccess(true)
            setCurrentStep("success")
            toast.success("Appointment booked successfully!")
          } catch (error: any) {
            console.error("Payment verification failed:", error)
            toast.error(error.response?.data?.message || "Payment verification failed")
          } finally {
            setIsProcessingPayment(false)
          }
        },
        prefill: {
          name: user.fullName,
          email: user.email,
          contact: user.phoneNumber || "",
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false)
            toast.info("Payment cancelled")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      console.error("Failed to create order:", error)
      toast.error(error.response?.data?.message || "Failed to initiate payment")
      setIsProcessingPayment(false)
    }
  }

  const filteredSpecializations = specializations.filter(
    (spec) =>
      spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const renderQuestionInput = (question: AppointmentQuestion) => {
    const error = formErrors[question._id]

    switch (question.questionType) {
      case "text":
        return (
          <div className="space-y-2">
            <Input
              placeholder={question.placeholder || "Enter your answer"}
              value={(answers[question._id] as string) || ""}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <Textarea
              placeholder={question.placeholder || "Enter your answer"}
              value={(answers[question._id] as string) || ""}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              rows={4}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "number":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder={question.placeholder || "Enter a number"}
              value={(answers[question._id] as number) || ""}
              onChange={(e) => handleAnswerChange(question._id, parseInt(e.target.value) || 0)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "date":
        return (
          <div className="space-y-2">
            <Input
              type="date"
              value={(answers[question._id] as string) || ""}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "select":
        return (
          <div className="space-y-2">
            <Select
              value={(answers[question._id] as string) || ""}
              onValueChange={(value) => handleAnswerChange(question._id, value)}
            >
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2">
            <RadioGroup
              value={(answers[question._id] as string) || ""}
              onValueChange={(value) => handleAnswerChange(question._id, value)}
            >
              {question.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question._id}-${option}`} />
                  <Label htmlFor={`${question._id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question._id}-${option}`}
                    checked={((answers[question._id] as string[]) || []).includes(option)}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                      handleCheckboxChange(question._id, option, checked === true)
                    }
                  />
                  <Label htmlFor={`${question._id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  // Step indicators
  const steps = [
    { key: "select", label: "Select Specialization" },
    { key: "questions", label: "Fill Details" },
    { key: "payment", label: "Payment" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <main className="min-h-screen pt-20 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Book an Appointment</h1>
            <p className="text-muted-foreground">
              Choose a specialization and book your consultation
            </p>
          </div>

          {/* Progress Steps */}
          {currentStep !== "success" && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 md:gap-4">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        index <= currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`ml-2 text-sm hidden md:inline ${
                        index <= currentStepIndex
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 md:w-16 h-0.5 mx-2 ${
                          index < currentStepIndex ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Select Specialization */}
          {currentStep === "select" && (
            <>
              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search specializations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Specializations Grid */}
              {isLoadingSpecializations ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2 mt-2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-16 bg-muted animate-pulse rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredSpecializations.length === 0 ? (
                <div className="text-center py-12">
                  <Stethoscope className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No specializations found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSpecializations.map((spec) => (
                    <Card
                      key={spec._id}
                      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group hover:border-primary"
                      onClick={() => handleSelectSpecialization(spec)}
                    >
                      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5">
                        {spec.imageUrl ? (
                          <img
                            src={spec.imageUrl}
                            alt={spec.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Stethoscope className="h-16 w-16 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {spec.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {spec.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {spec.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center pt-0">
                        <div className="flex items-center text-lg font-semibold text-primary">
                          <IndianRupee className="h-4 w-4" />
                          {spec.consultationFee}
                        </div>
                        <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                          Book Now
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 2: Questions Form */}
          {currentStep === "questions" && selectedSpecialization && (
            <div className="max-w-2xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("select")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Specializations
              </Button>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {selectedSpecialization.imageUrl ? (
                      <img
                        src={selectedSpecialization.imageUrl}
                        alt={selectedSpecialization.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle>{selectedSpecialization.name}</CardTitle>
                      <CardDescription>{selectedSpecialization.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingQuestions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No additional information required
                      </p>
                      <Button onClick={handleProceedToPayment}>
                        Proceed to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {questions.map((question, index) => (
                        <div key={question._id} className="space-y-2">
                          <Label className="text-base">
                            {index + 1}. {question.question}
                            {question.isRequired && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          {renderQuestionInput(question)}
                        </div>
                      ))}

                      <Separator className="my-6" />

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Consultation Fee</p>
                          <p className="text-2xl font-bold text-primary flex items-center">
                            <IndianRupee className="h-5 w-5" />
                            {selectedSpecialization.consultationFee}
                          </p>
                        </div>
                        <Button onClick={handleProceedToPayment} size="lg">
                          Proceed to Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Payment Confirmation */}
          {currentStep === "payment" && selectedSpecialization && (
            <div className="max-w-lg mx-auto">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("questions")}
                className="mb-4"
                disabled={isProcessingPayment}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Form
              </Button>

              <Card>
                <CardHeader>
                  <CardTitle>Confirm Payment</CardTitle>
                  <CardDescription>Review your booking details before payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    {selectedSpecialization.imageUrl ? (
                      <img
                        src={selectedSpecialization.imageUrl}
                        alt={selectedSpecialization.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{selectedSpecialization.name}</h3>
                      <p className="text-sm text-muted-foreground">Consultation</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Consultation Fee</span>
                      <span>₹{selectedSpecialization.consultationFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span>₹0</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">₹{selectedSpecialization.consultationFee}</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      After successful payment, our team will review your details and confirm the appointment.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay ₹{selectedSpecialization.consultationFee}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === "success" && (
            <div className="max-w-lg mx-auto">
              <Card>
                <CardContent className="pt-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your appointment has been booked successfully. We will review your details and confirm shortly.
                  </p>
                  <div className="flex flex-col gap-3">
                    {appointmentId && (
                      <Button onClick={() => router.push(`/appointments/${appointmentId}`)}>
                        View Appointment Details
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => router.push("/profile?tab=appointments")}>
                      Go to My Appointments
                    </Button>
                    <Button variant="ghost" onClick={() => {
                      setCurrentStep("select")
                      setSelectedSpecialization(null)
                      setQuestions([])
                      setAnswers({})
                      setBookingSuccess(false)
                      setAppointmentId(null)
                    }}>
                      Book Another Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
