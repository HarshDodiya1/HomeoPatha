"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth.store"
import { orderService } from "@/lib/services/order.service"
import { Order } from "@/types/order"
import Image from "next/image"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isInitialized, initialize } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

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
      fetchOrderDetails()
    }
  }, [isAuthenticated, params.id])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    try {
      const response = await orderService.getOrderDetails(params.id as string)
      setOrder(response.data.data.order)
    } catch (error: any) {
      console.error('Failed to fetch order details:', error)
      toast.error(error.response?.data?.message || 'Failed to load order details')
      router.push('/profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) return

    setIsCancelling(true)
    try {
      await orderService.cancelOrder(order._id)
      toast.success('Order cancelled successfully')
      fetchOrderDetails()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'processing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'shipped':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'delivered':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
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

  if (!order) return null

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Order Details</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Order ID: {order._id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
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
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items Ordered
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    <p className="text-sm text-muted-foreground">Price: ₹{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.pincode}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </Badge>
              </div>
              {order.paymentDetails?.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-xs">{order.paymentDetails.razorpayPaymentId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Timeline */}
          {order.estimatedDelivery && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Delivery</span>
                    <span className="font-medium">
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {order.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered On</span>
                      <span className="font-medium">
                        {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancel Order Button */}
          {!['cancelled', 'delivered', 'shipped'].includes(order.orderStatus) && (
            <Card className="bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Cancel Order</h3>
                    <p className="text-sm text-muted-foreground">
                      You can cancel this order if it hasn't been shipped yet.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Order'
                    )}
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
