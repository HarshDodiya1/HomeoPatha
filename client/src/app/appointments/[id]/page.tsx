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
  MapPin,
  FileText,
  DollarSign,
  Stethoscope,
  Award,
  Briefcase
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
      case 'rescheduled':
        return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
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

  const doctor = appointment.doctorId

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
                    {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctor?.images && doctor.images.length > 0 && (
                <div className="flex justify-center mb-4">
                  <img
                    src={doctor.images[0]}
                    alt={doctor?.userId?.fullName || 'Doctor'}
                    className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor Name</p>
                    <p className="font-medium">{doctor?.userId?.fullName || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Specialization</p>
                    <p className="font-medium">{(doctor as any)?.specialization || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Qualification</p>
                    <p className="font-medium">{(doctor as any)?.qualification || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{(doctor as any)?.experience || 0} years</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{doctor?.userId?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Number</p>
                    <a 
                      href={`tel:${doctor?.userId?.phoneNumber}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {doctor?.userId?.phoneNumber || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>

              {(doctor as any)?.about && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">About Doctor</p>
                    <p className="text-sm">{(doctor as any).about}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Appointment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
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
                    <p className="font-medium">{appointment.appointmentTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{appointment.duration} minutes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Consultation Fee</p>
                    <p className="font-medium text-lg text-primary">₹{appointment.consultationFee}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reason for Visit</p>
                  <p className="font-medium">{appointment.reason}</p>
                </div>

                {appointment.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Additional Notes</p>
                    <p className="text-sm">{appointment.notes}</p>
                  </div>
                )}

                {appointment.prescription && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Prescription</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{appointment.prescription}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
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
                {appointment.razorpayOrderId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-xs mt-1">{appointment.razorpayOrderId}</p>
                  </div>
                )}
                {appointment.razorpayPaymentId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-xs mt-1">{appointment.razorpayPaymentId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Doctor Button */}
          {doctor?.userId?.phoneNumber && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Need to contact the doctor?</h3>
                    <p className="text-sm text-muted-foreground">
                      You can call the doctor directly for any queries or concerns.
                    </p>
                  </div>
                  <Button size="lg" onClick={() => window.location.href = `tel:${doctor.userId.phoneNumber}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
