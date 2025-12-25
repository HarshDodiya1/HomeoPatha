"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, Suspense } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Loader2, 
  User as UserIcon, 
  Mail, 
  Phone, 
  LogOut, 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  ShoppingBag,
  Settings,
  Sparkles,
  Shield,
  CheckCircle,
  Timer,
  XCircle,
  CreditCard,
  Truck,
  ChevronRight,
  Edit3,
  Save,
  RotateCcw,
  AlertCircle,
  IndianRupee,
  Stethoscope,
  ArrowRight
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Separator } from "@/components/ui/separator"
import apiClient from "@/lib/api/client"
import { Appointment } from "@/types/appointment"
import { Order } from "@/types/order"
import Image from "next/image"

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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

function ProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isInitialized, initialize, updateProfile, logout, isLoading } = useAuthStore()

  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "")
      setPhoneNumber(user.phoneNumber || "")
    }
  }, [user])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    if (activeTab === 'appointments' && isAuthenticated) {
      fetchAppointments()
    } else if (activeTab === 'orders' && isAuthenticated) {
      fetchOrders()
    }
  }, [activeTab, isAuthenticated])

  const fetchAppointments = async () => {
    setIsLoadingAppointments(true)
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          appointments: Appointment[];
        };
      }>('/api/users/appointments')
      setAppointments(response.data.data.appointments)
    } catch (error: any) {
      console.error('Failed to fetch appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setIsLoadingAppointments(false)
    }
  }

  const fetchOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          orders: Order[];
        };
      }>('/api/orders')
      setOrders(response.data.data.orders)
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { 
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
          icon: CheckCircle,
          bgGradient: 'from-emerald-500/10 to-emerald-600/5'
        }
      case 'completed':
      case 'delivered':
        return { 
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          icon: CheckCircle,
          bgGradient: 'from-green-500/10 to-green-600/5'
        }
      case 'pending':
      case 'processing':
        return { 
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          icon: Timer,
          bgGradient: 'from-amber-500/10 to-amber-600/5'
        }
      case 'shipped':
        return { 
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          icon: Truck,
          bgGradient: 'from-blue-500/10 to-blue-600/5'
        }
      case 'cancelled':
        return { 
          color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
          icon: XCircle,
          bgGradient: 'from-rose-500/10 to-rose-600/5'
        }
      default:
        return { 
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
          icon: AlertCircle,
          bgGradient: 'from-slate-500/10 to-slate-600/5'
        }
    }
  }

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          icon: CheckCircle
        }
      case 'pending':
        return { 
          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
          icon: Timer
        }
      case 'failed':
        return { 
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          icon: XCircle
        }
      case 'refunded':
        return { 
          color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
          icon: RotateCcw
        }
      default:
        return { 
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
          icon: AlertCircle
        }
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim()) {
      toast.error("Please enter your full name")
      return
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number")
      return
    }

    try {
      setIsUpdating(true)
      await updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      })
      toast.success("Profile updated successfully!")
    } catch (err: any) {
      console.error('Update profile error:', err)
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      router.push('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (!isInitialized || !user) {
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

  return (
    <div className="min-h-screen pb-16 pt-28 relative overflow-hidden">
      {/* Premium background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.06),transparent_60%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(22,163,74,0.06),transparent_60%)] -z-10" />
      
      {/* Floating decorative elements */}
      <div className="fixed top-40 right-20 w-3 h-3 rounded-full bg-primary/30 animate-bounce pointer-events-none" style={{ animationDelay: '0s' }} />
      <div className="fixed top-72 left-16 w-2 h-2 rounded-full bg-accent/30 animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }} />
      <div className="fixed bottom-40 right-1/4 w-2 h-2 rounded-full bg-primary/20 animate-bounce pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[28px] blur-lg opacity-50" />
            <Card className="relative rounded-3xl border-border/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-40" />
                      <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
                        <UserIcon className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">Premium Member</span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {user.fullName}
                      </h1>
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-0 rounded-full px-4 py-1.5">
                      <Shield className="h-3.5 w-3.5 mr-1.5" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Button 
                      variant="outline" 
                      onClick={handleLogout}
                      className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'from-blue-500 to-blue-600' },
            { label: 'Appointments', value: appointments.length, icon: Calendar, color: 'from-purple-500 to-purple-600' },
            { label: 'Completed', value: orders.filter(o => o.orderStatus === 'delivered').length + appointments.filter(a => a.status === 'completed').length, icon: CheckCircle, color: 'from-green-500 to-green-600' },
            { label: 'Pending', value: orders.filter(o => o.orderStatus === 'pending').length + appointments.filter(a => a.status === 'pending').length, icon: Clock, color: 'from-amber-500 to-amber-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            >
              <Card className="rounded-2xl border-border/50 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs for Profile, Appointments, and Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 p-1.5 bg-secondary/50 rounded-2xl h-auto">
              <TabsTrigger 
                value="profile" 
                className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-md transition-all"
              >
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="appointments"
                className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-md transition-all"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-md transition-all"
              >
                <Package className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="rounded-3xl border-border/50 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Edit3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details here</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <Input
                              id="fullName"
                              placeholder="John Doe"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              disabled={isUpdating}
                              className="pl-16 h-14 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              id="email"
                              value={user.email}
                              disabled
                              className="pl-16 h-14 rounded-xl bg-muted/50 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <Input
                              id="phoneNumber"
                              type="tel"
                              placeholder="9876543210"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              disabled={isUpdating}
                              className="pl-16 h-14 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              id="role"
                              value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              disabled
                              className="pl-16 h-14 rounded-xl bg-muted/50 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFullName(user.fullName || "")
                            setPhoneNumber(user.phoneNumber || "")
                          }}
                          disabled={isUpdating}
                          className="rounded-full px-6"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isUpdating}
                          className="rounded-full px-8 shadow-lg shadow-primary/25"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="mt-6 space-y-4">
              {isLoadingAppointments ? (
                <Card className="rounded-3xl border-border/50">
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping opacity-30">
                        <Loader2 className="h-10 w-10 text-primary" />
                      </div>
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ) : appointments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="rounded-3xl border-border/50 overflow-hidden">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
                        <Calendar className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Appointments Yet</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Book your first consultation with our expert homeopathy doctors
                      </p>
                      <Button 
                        onClick={() => router.push('/appointments')}
                        className="rounded-full px-8 shadow-lg shadow-primary/25"
                      >
                        Book Appointment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {appointments.map((appointment, index) => {
                    const statusConfig = getStatusConfig(appointment.status)
                    const paymentConfig = getPaymentStatusConfig(appointment.paymentStatus)
                    const StatusIcon = statusConfig.icon
                    const PaymentIcon = paymentConfig.icon

                    return (
                      <motion.div key={appointment._id} variants={itemVariants}>
                        <Card 
                          className="rounded-3xl border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                          onClick={() => router.push(`/appointments/${appointment._id}`)}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                              {/* Icon/Image */}
                              <div className="flex-shrink-0">
                                {appointment.specializationId?.imageUrl ? (
                                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                                    <Image
                                      src={appointment.specializationId.imageUrl}
                                      alt={appointment.specializationId?.name || 'Specialization'}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                ) : (
                                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${statusConfig.bgGradient} flex items-center justify-center`}>
                                    <Stethoscope className="h-10 w-10 text-primary" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {appointment.specializationId?.name || 'Consultation'}
                                  </h3>
                                  <Badge className={`${statusConfig.color} rounded-full px-3 py-0.5 text-xs flex items-center gap-1`}>
                                    <StatusIcon className="h-3 w-3" />
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  {appointment.questionResponses && appointment.questionResponses.length > 0 && (
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="h-4 w-4" />
                                      {appointment.questionResponses.length} responses
                                    </span>
                                  )}
                                </div>

                                <Badge className={`${paymentConfig.color} rounded-full px-3 py-0.5 text-xs flex items-center gap-1 w-fit`}>
                                  <PaymentIcon className="h-3 w-3" />
                                  Payment: {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                                </Badge>
                              </div>

                              {/* Price & Action */}
                              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground mb-0.5">Consultation Fee</p>
                                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    ₹{appointment.consultationFee}
                                  </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                  <ChevronRight className="h-5 w-5" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6 space-y-4">
              {isLoadingOrders ? (
                <Card className="rounded-3xl border-border/50">
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping opacity-30">
                        <Loader2 className="h-10 w-10 text-primary" />
                      </div>
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ) : orders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="rounded-3xl border-border/50 overflow-hidden">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
                        <Package className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Browse our products and place your first order
                      </p>
                      <Button 
                        onClick={() => router.push('/products')}
                        className="rounded-full px-8 shadow-lg shadow-primary/25"
                      >
                        Browse Products
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {orders.map((order, index) => {
                    const statusConfig = getStatusConfig(order.orderStatus)
                    const paymentConfig = getPaymentStatusConfig(order.paymentStatus)
                    const StatusIcon = statusConfig.icon
                    const PaymentIcon = paymentConfig.icon

                    return (
                      <motion.div key={order._id} variants={itemVariants}>
                        <Card 
                          className="rounded-3xl border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                          onClick={() => router.push(`/orders/${order._id}`)}
                        >
                          <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-border/50">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusConfig.bgGradient} flex items-center justify-center`}>
                                  <ShoppingBag className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    Order #{order._id.slice(-8).toUpperCase()}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge className={`${statusConfig.color} rounded-full px-3 py-1 text-xs flex items-center gap-1`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                </Badge>
                                <Badge className={`${paymentConfig.color} rounded-full px-3 py-1 text-xs flex items-center gap-1`}>
                                  <PaymentIcon className="h-3 w-3" />
                                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                </Badge>
                              </div>
                            </div>

                            {/* Items Preview */}
                            <div className="space-y-3 mb-4">
                              {order.orderItems.slice(0, 2).map((item) => (
                                <div key={item._id} className="flex gap-4 items-center">
                                  <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-muted shadow-sm">
                                    {item.image ? (
                                      <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              ))}
                              {order.orderItems.length > 2 && (
                                <p className="text-sm text-muted-foreground text-center py-1">
                                  +{order.orderItems.length - 2} more items
                                </p>
                              )}
                            </div>

                            {/* Shipping & Total */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-border/50">
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5" />
                                <span>
                                  {order.shippingAddress.city}, {order.shippingAddress.state}
                                </span>
                              </div>
                              <div className="flex items-center justify-between md:justify-end gap-6">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Total</p>
                                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    ₹{order.totalAmount.toFixed(2)}
                                  </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                  <ChevronRight className="h-5 w-5" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-30">
            <Loader2 className="h-10 w-10 text-primary" />
          </div>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}
