"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  const specialization = appointment.specializationId

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/profile?tab=appointments')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Appointment Details</CardTitle>
                  <CardDescription className="mt-2">
                    Booking ID: {appointment._id}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                  <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                    Payment: {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Specialization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Consultation Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {specialization?.imageUrl ? (
                  <img
                    src={specialization.imageUrl}
                    alt={specialization.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{specialization?.name || 'Consultation'}</h3>
                  <p className="text-muted-foreground mt-1">{specialization?.description}</p>
                  {specialization?.tags && specialization.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {specialization.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Booked On</p>
                    <p className="font-medium">
                      {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {new Date(appointment.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <IndianRupee className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Consultation Fee</p>
                    <p className="font-medium text-lg text-primary">₹{appointment.consultationFee}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Responses */}
          {appointment.questionResponses && appointment.questionResponses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Your Responses
                </CardTitle>
                <CardDescription>
                  Information you provided during booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointment.questionResponses.map((response, index) => (
                    <div key={response.questionId} className="border-b last:border-0 pb-4 last:pb-0">
                      <p className="font-medium text-sm mb-1">
                        {index + 1}. {response.question}
                      </p>
                      <p className="text-muted-foreground">
                        {Array.isArray(response.answer) 
                          ? response.answer.join(', ') 
                          : response.answer.toString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prescription */}
          {appointment.prescription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{appointment.prescription}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge className={`${getPaymentStatusColor(appointment.paymentStatus)} mt-1`}>
                    {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-2xl font-bold text-primary mt-1">₹{appointment.consultationFee}</p>
                </div>
                {appointment.paymentDetails?.razorpayOrderId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-xs mt-1">{appointment.paymentDetails.razorpayOrderId}</p>
                  </div>
                )}
                {appointment.paymentDetails?.razorpayPaymentId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-xs mt-1">{appointment.paymentDetails.razorpayPaymentId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Info */}
          {appointment.status === 'cancelled' && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Cancellation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {appointment.cancelledBy && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Cancelled by: </span>
                      <span className="font-medium capitalize">{appointment.cancelledBy}</span>
                    </p>
                  )}
                  {appointment.cancelReason && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Reason: </span>
                      <span>{appointment.cancelReason}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
