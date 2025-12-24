"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence, Variants } from "framer-motion"
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
  Sparkles,
  Clock,
  Users,
  Star,
  Calendar,
  Shield,
  Heart,
} from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth.store"
import { specializationService } from "@/lib/services/specialization.service"
import { appointmentService } from "@/lib/services/appointment.service"
import { Specialization, AppointmentQuestion } from "@/types/specialization"
import Script from "next/script"

type BookingStep = "select" | "questions" | "payment" | "success"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

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
      <main className="min-h-screen pt-28 pb-16 relative overflow-hidden">
        {/* Premium background */}
        <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.06),transparent_60%)] -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(22,163,74,0.06),transparent_60%)] -z-10" />
        
        {/* Floating decorative elements */}
        <div className="fixed top-32 right-20 w-3 h-3 rounded-full bg-primary/30 animate-bounce pointer-events-none" style={{ animationDelay: '0s' }} />
        <div className="fixed top-60 left-16 w-2 h-2 rounded-full bg-accent/30 animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }} />
        <div className="fixed bottom-32 right-1/4 w-2 h-2 rounded-full bg-primary/20 animate-bounce pointer-events-none" style={{ animationDelay: '1s' }} />

        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-medium mb-4 border border-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              Book Consultation
            </motion.span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Book an <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Appointment</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Choose a specialization and book your consultation with expert homeopathy doctors.
            </p>
          </motion.div>

          {/* Progress Steps */}
          {currentStep !== "success" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10"
            >
              <div className="flex items-center justify-center gap-2 md:gap-4">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                        index <= currentStepIndex
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                          : "bg-white dark:bg-card border-2 border-border/50 text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm hidden md:inline transition-colors ${
                        index <= currentStepIndex
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-12 md:w-20 h-1 mx-3 rounded-full transition-colors ${
                          index < currentStepIndex 
                            ? "bg-gradient-to-r from-primary to-accent" 
                            : "bg-border/50"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Select Specialization */}
          {currentStep === "select" && (
            <>
              {/* Search */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-8"
              >
                <div className="relative max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search specializations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-white dark:bg-card border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
              </motion.div>

              {/* Specializations Grid */}
              <AnimatePresence mode="wait">
                {isLoadingSpecializations ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-xl opacity-30" />
                        <div className="relative bg-white dark:bg-card rounded-3xl overflow-hidden border border-border/50">
                          <div className="h-44 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
                          <div className="p-6 space-y-3">
                            <div className="h-6 bg-muted animate-pulse rounded-lg w-3/4" />
                            <div className="h-4 bg-muted animate-pulse rounded-lg w-full" />
                            <div className="h-12 bg-muted animate-pulse rounded-xl mt-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : filteredSpecializations.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Stethoscope className="h-12 w-12 text-primary/60" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">No specializations found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Try adjusting your search to find what you're looking for.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-6 rounded-full"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear Search
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="specializations"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredSpecializations.map((spec) => (
                      <motion.div key={spec._id} variants={itemVariants}>
                        <div 
                          className="relative cursor-pointer group"
                          onClick={() => handleSelectSpecialization(spec)}
                        >
                          {/* Glow effect on hover */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-[28px] blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                          
                          <div className="relative bg-white dark:bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/10">
                            {/* Top accent bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                            
                            {/* Image */}                            <div className="relative h-44 overflow-hidden">
                              {spec.imageUrl ? (
                                <Image
                                  src={spec.imageUrl}
                                  alt={spec.name}
                                  fill
                                  className="object-cover transition-all duration-700 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/50 to-accent/10">
                                  <div className="relative">
                                    <div className="absolute inset-0 animate-ping opacity-30">
                                      <Stethoscope className="h-16 w-16 text-primary" />
                                    </div>
                                    <Stethoscope className="h-16 w-16 text-primary/60" />
                                  </div>
                                </div>
                              )}
                              
                              {/* Gradient overlays */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              
                              {/* Available badge */}
                              <div className="absolute top-4 right-4">
                                <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-lg flex items-center gap-1.5 border border-white/20">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-xs font-medium text-foreground">Available</span>
                                </div>
                              </div>

                              {/* Bottom content overlay */}
                              <div className="absolute bottom-0 left-0 right-0 p-5">
                                <div className="flex items-center gap-1.5 mb-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400 drop-shadow-sm"
                                    />
                                  ))}
                                  <span className="text-sm text-white/90 ml-1 font-medium">(5.0)</span>
                                </div>
                                <h3 className="text-xl font-bold text-white drop-shadow-lg group-hover:text-primary-foreground">
                                  {spec.name}
                                </h3>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                {spec.description}
                              </p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {spec.tags.slice(0, 3).map((tag) => (
                                  <Badge 
                                    key={tag} 
                                    variant="secondary" 
                                    className="text-xs rounded-full bg-secondary/80 hover:bg-secondary"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              {/* Stats row */}
                              <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                                  <span>30 min</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5 text-primary" />
                                  <span>1000+ patients</span>
                                </div>
                              </div>

                              {/* Price and CTA */}
                              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Consultation</span>
                                  <div className="flex items-baseline gap-0.5">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">₹{spec.consultationFee}</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 gap-1.5"
                                >
                                  <Calendar className="h-4 w-4" />
                                  Book Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Step 2: Questions Form */}
          {currentStep === "questions" && selectedSpecialization && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("select")}
                className="mb-6 rounded-full hover:bg-primary/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Specializations
              </Button>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[28px] blur-lg opacity-50" />
                <Card className="relative rounded-3xl border-border/50 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      {selectedSpecialization.imageUrl ? (
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                          <Image
                            src={selectedSpecialization.imageUrl}
                            alt={selectedSpecialization.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Stethoscope className="h-10 w-10 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-xl">{selectedSpecialization.name}</CardTitle>
                        <CardDescription className="mt-1">{selectedSpecialization.description}</CardDescription>
                        <div className="flex items-center gap-1.5 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-sm text-muted-foreground ml-1">(5.0)</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingQuestions ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="relative">
                          <div className="absolute inset-0 animate-ping opacity-30">
                            <Loader2 className="h-10 w-10 text-primary" />
                          </div>
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                      </div>
                    ) : questions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-muted-foreground mb-6">
                          No additional information required
                        </p>
                        <Button 
                          onClick={handleProceedToPayment}
                          className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
                        >
                          Proceed to Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {questions.map((question, index) => (
                          <motion.div 
                            key={question._id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border/50"
                          >
                            <Label className="text-base font-medium flex items-start gap-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                                {index + 1}
                              </span>
                              <span>
                                {question.question}
                                {question.isRequired && (
                                  <span className="text-rose-500 ml-1">*</span>
                                )}
                              </span>
                            </Label>
                            {renderQuestionInput(question)}
                          </motion.div>
                        ))}

                        <Separator className="my-8" />

                        <div className="flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
                          <div>
                            <p className="text-sm text-muted-foreground">Consultation Fee</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center">
                              ₹{selectedSpecialization.consultationFee}
                            </p>
                          </div>
                          <Button 
                            onClick={handleProceedToPayment} 
                            size="lg"
                            className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 gap-2"
                          >
                            Proceed to Payment
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Confirmation */}
          {currentStep === "payment" && selectedSpecialization && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto"
            >
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("questions")}
                className="mb-6 rounded-full hover:bg-primary/10"
                disabled={isProcessingPayment}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Form
              </Button>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[28px] blur-lg opacity-50" />
                <Card className="relative rounded-3xl border-border/50 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  <CardHeader>
                    <CardTitle className="text-xl">Confirm Payment</CardTitle>
                    <CardDescription>Review your booking details before payment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-2xl border border-border/50">
                      {selectedSpecialization.imageUrl ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md">
                          <Image
                            src={selectedSpecialization.imageUrl}
                            alt={selectedSpecialization.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Stethoscope className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedSpecialization.name}</h3>
                        <p className="text-sm text-muted-foreground">Consultation</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3 p-4 rounded-2xl bg-secondary/20">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consultation Fee</span>
                        <span className="font-medium">₹{selectedSpecialization.consultationFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <span className="font-medium text-green-600">₹0 (Free)</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">₹{selectedSpecialization.consultationFee}</span>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex items-start gap-3 border border-amber-200/50 dark:border-amber-800/50">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        After successful payment, our team will review your details and confirm the appointment.
                      </p>
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-6 pt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Heart className="h-4 w-4 text-primary" />
                        <span>Quality Care</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pb-6">
                    <Button
                      onClick={handlePayment}
                      disabled={isProcessingPayment}
                      className="w-full rounded-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
                      size="lg"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
            </motion.div>
          )}

          {/* Step 4: Success */}
          {currentStep === "success" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-[28px] blur-lg opacity-50" />
                <Card className="relative rounded-3xl border-green-200 dark:border-green-800/50 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400" />
                  <CardContent className="pt-10 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center shadow-lg shadow-green-500/20"
                    >
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold mb-2"
                    >
                      Booking Confirmed! 🎉
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-muted-foreground mb-8 max-w-sm mx-auto"
                    >
                      Your appointment has been booked successfully. We will review your details and confirm shortly.
                    </motion.p>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col gap-3"
                    >
                      {appointmentId && (
                        <Button 
                          onClick={() => router.push(`/appointments/${appointmentId}`)}
                          className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
                        >
                          View Appointment Details
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => router.push("/profile?tab=appointments")}
                        className="rounded-full border-primary/30 hover:bg-primary/10"
                      >
                        Go to My Appointments
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setCurrentStep("select")
                          setSelectedSpecialization(null)
                          setQuestions([])
                          setAnswers({})
                          setBookingSuccess(false)
                          setAppointmentId(null)
                        }}
                        className="rounded-full hover:bg-secondary"
                      >
                        Book Another Appointment
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  )
}
