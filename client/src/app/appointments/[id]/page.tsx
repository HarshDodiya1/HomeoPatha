"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText,
  Stethoscope,
  MessageSquare,
  IndianRupee,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  XCircle,
  Timer,
  CreditCard,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import apiClient from "@/lib/api/client"
import { Appointment } from "@/types/appointment"
import { useAuthStore } from "@/store/auth.store"

export default function AppointmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isInitialized, initialize } = useAuthStore()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchAppointmentDetails()
    }
  }, [isAuthenticated, params.id])

  const fetchAppointmentDetails = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          appointment: Appointment;
        };
      }>(`/api/users/appointments/${params.id}`)
      setAppointment(response.data.data.appointment)
    } catch (error: any) {
      console.error('Failed to fetch appointment details:', error)
      toast.error(error.response?.data?.message || 'Failed to load appointment details')
      router.push('/profile?tab=appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'cancelled':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'refunded':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  if (!isInitialized || isLoading) {
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

  if (!appointment) {
    return null
  }

  const specialization = appointment.specializationId

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Timer className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen pb-12 pt-28 relative overflow-hidden">
      {/* Premium background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.05),transparent_60%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(22,163,74,0.05),transparent_60%)] -z-10" />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/profile?tab=appointments')}
            className="mb-6 rounded-full hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Button>
        </motion.div>

        <div className="space-y-6">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[28px] blur-lg opacity-50" />
              <Card className="relative rounded-3xl border-border/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-2xl">Appointment Details</CardTitle>
                      </div>
                      <CardDescription className="font-mono text-xs">
                        Booking ID: {appointment._id}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getStatusColor(appointment.status)} rounded-full px-3 py-1 flex items-center gap-1.5`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                      <Badge className={`${getPaymentStatusColor(appointment.paymentStatus)} rounded-full px-3 py-1 flex items-center gap-1.5`}>
                        <CreditCard className="h-3.5 w-3.5" />
                        {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </motion.div>

          {/* Specialization Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="rounded-3xl border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-primary" />
                  </div>
                  Consultation Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-5">
                  {specialization?.imageUrl ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                      <Image
                        src={specialization.imageUrl}
                        alt={specialization.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="h-12 w-12 text-primary/60" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{specialization?.name || 'Consultation'}</h3>
                    <p className="text-muted-foreground mt-1 leading-relaxed">{specialization?.description}</p>
                    {specialization?.tags && specialization.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {specialization.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-3xl border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Booked On</p>
                      <p className="font-semibold text-sm">
                        {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-semibold text-sm">
                        {new Date(appointment.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Consultation Fee</p>
                      <p className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ₹{appointment.consultationFee}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Question Responses */}
          {appointment.questionResponses && appointment.questionResponses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="rounded-3xl border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                    Your Responses
                  </CardTitle>
                  <CardDescription>
                    Information you provided during booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointment.questionResponses.map((response, index) => (
                      <div 
                        key={response.questionId} 
                        className="p-4 rounded-2xl bg-secondary/30 border border-border/50"
                      >
                        <p className="font-semibold text-sm mb-2 flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          {response.question}
                        </p>
                        <p className="text-muted-foreground pl-8">
                          {Array.isArray(response.answer) 
                            ? response.answer.join(', ') 
                            : response.answer.toString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Prescription */}
          {appointment.prescription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[28px] blur-lg opacity-50" />
                <Card className="relative rounded-3xl border-border/50 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      Prescription
                      <Badge className="ml-2 bg-primary/10 text-primary rounded-full">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Doctor's Notes
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-secondary/50 to-secondary/20 p-5 rounded-2xl border border-border/50">
                      <p className="whitespace-pre-wrap leading-relaxed">{appointment.prescription}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="rounded-3xl border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-2">Payment Status</p>
                    <Badge className={`${getPaymentStatusColor(appointment.paymentStatus)} rounded-full px-3 py-1`}>
                      {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ₹{appointment.consultationFee}
                    </p>
                  </div>
                  {appointment.paymentDetails?.razorpayOrderId && (
                    <div className="p-4 rounded-2xl bg-secondary/20">
                      <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                      <p className="font-mono text-xs bg-background/50 p-2 rounded-lg">{appointment.paymentDetails.razorpayOrderId}</p>
                    </div>
                  )}
                  {appointment.paymentDetails?.razorpayPaymentId && (
                    <div className="p-4 rounded-2xl bg-secondary/20">
                      <p className="text-xs text-muted-foreground mb-1">Payment ID</p>
                      <p className="font-mono text-xs bg-background/50 p-2 rounded-lg">{appointment.paymentDetails.razorpayPaymentId}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cancellation Info */}
          {appointment.status === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Card className="rounded-3xl border-red-200/50 dark:border-red-800/50 overflow-hidden bg-red-50/50 dark:bg-red-950/20">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600" />
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    Cancellation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointment.cancelledBy && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-100/50 dark:bg-red-900/20">
                        <span className="text-sm text-muted-foreground">Cancelled by:</span>
                        <Badge variant="outline" className="rounded-full capitalize border-red-200 text-red-600">
                          {appointment.cancelledBy}
                        </Badge>
                      </div>
                    )}
                    {appointment.cancelReason && (
                      <div className="p-3 rounded-xl bg-red-100/50 dark:bg-red-900/20">
                        <span className="text-sm text-muted-foreground">Reason:</span>
                        <p className="mt-1 font-medium">{appointment.cancelReason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
