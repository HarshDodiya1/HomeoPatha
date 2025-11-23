"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, Suspense } from "react"
import { toast } from "sonner"
import { Loader2, User as UserIcon, Mail, Phone, LogOut, Calendar, Clock, MapPin, Package, ShoppingBag } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Separator } from "@/components/ui/separator"
import apiClient from "@/lib/api/client"
import { Appointment } from "@/types/appointment"
import { Order } from "@/types/order"
import Image from "next/image"

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
      case 'delivered':
        return 'bg-green-500'
      case 'pending':
      case 'processing':
        return 'bg-yellow-500'
      case 'shipped':
        return 'bg-blue-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs for Profile and Appointments */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details here</CardDescription>
              </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isUpdating}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isUpdating}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    disabled
                    className="bg-muted"
                  />
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
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            {isLoadingAppointments ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No appointments found</p>
                  <p className="text-sm text-muted-foreground mt-2">Book your first appointment with a doctor</p>
                  <Button className="mt-4" onClick={() => router.push('/doctors')}>
                    Browse Doctors
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment._id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <UserIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {appointment.doctorId?.userId?.fullName || 'Doctor'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {(appointment.doctorId as any)?.specialization || 'Specialist'}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{appointment.appointmentTime}</span>
                            </div>
                          </div>

                          <div className="text-sm">
                            <span className="text-muted-foreground">Reason: </span>
                            <span className="font-medium">{appointment.reason}</span>
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

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Consultation Fee</p>
                            <p className="text-2xl font-bold text-primary">₹{appointment.consultationFee}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/appointments/${appointment._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {isLoadingOrders ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No orders found</p>
                  <p className="text-sm text-muted-foreground mt-2">Start shopping to see your orders here</p>
                  <Button className="mt-4" onClick={() => router.push('/products')}>
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order._id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Order Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold text-lg">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(order.orderStatus)}>
                              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </Badge>
                            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </Badge>
                            <Badge variant="outline">
                              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                            </Badge>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.orderItems.map((item) => (
                            <div key={item._id} className="flex gap-3">
                              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                {item.image && (
                                  <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{item.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                </p>
                                <p className="text-sm font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Shipping Address */}
                        <div className="pt-3 border-t">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium mb-1">Shipping Address</p>
                              <p className="text-muted-foreground">
                                {order.shippingAddress.addressLine1}
                                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                <br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Order Footer */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t">
                          <div className="text-right md:text-left">
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/orders/${order._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}
