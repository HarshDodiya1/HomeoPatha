"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Loader2, 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Truck,
  Sparkles,
  CheckCircle,
  Timer,
  XCircle,
  AlertCircle,
  ShoppingBag,
  IndianRupee,
  Clock,
  RotateCcw
} from "lucide-react"
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
      router.push('/profile?tab=orders')
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { 
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
          icon: CheckCircle,
          bgGradient: 'from-emerald-500/10 to-emerald-600/5'
        }
      case 'pending':
        return { 
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          icon: Timer,
          bgGradient: 'from-amber-500/10 to-amber-600/5'
        }
      case 'processing':
        return { 
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          icon: Clock,
          bgGradient: 'from-blue-500/10 to-blue-600/5'
        }
      case 'shipped':
        return { 
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
          icon: Truck,
          bgGradient: 'from-purple-500/10 to-purple-600/5'
        }
      case 'delivered':
        return { 
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          icon: CheckCircle,
          bgGradient: 'from-green-500/10 to-green-600/5'
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

  if (!order) return null

  const statusConfig = getStatusConfig(order.orderStatus)
  const paymentConfig = getPaymentStatusConfig(order.paymentStatus)
  const StatusIcon = statusConfig.icon
  const PaymentIcon = paymentConfig.icon

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
            onClick={() => router.push('/profile?tab=orders')}
            className="mb-6 rounded-full hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
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
                        <CardTitle className="text-2xl">Order Details</CardTitle>
                      </div>
                      <CardDescription className="space-y-1">
                        <p className="font-mono text-xs">Order ID: {order._id}</p>
                        <p className="text-sm">
                          Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${statusConfig.color} rounded-full px-3 py-1 flex items-center gap-1.5`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </Badge>
                      <Badge className={`${paymentConfig.color} rounded-full px-3 py-1 flex items-center gap-1.5`}>
                        <PaymentIcon className="h-3.5 w-3.5" />
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="rounded-3xl border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  Items Ordered
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <motion.div 
                    key={item._id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    className="flex gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50"
                  >
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm">
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
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="text-sm text-muted-foreground">Price: ₹{item.price}</p>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}

                <Separator className="my-4" />

                <div className="flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ₹{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-3xl border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <p className="font-medium">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="text-muted-foreground">{order.shippingAddress.addressLine2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p className="text-muted-foreground font-medium">{order.shippingAddress.pincode}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
                    <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-semibold">
                      {order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-2">Payment Status</p>
                    <Badge className={`${paymentConfig.color} rounded-full px-3 py-1 flex items-center gap-1 w-fit`}>
                      <PaymentIcon className="h-3 w-3" />
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  {order.paymentDetails?.razorpayPaymentId && (
                    <div className="p-4 rounded-2xl bg-secondary/20 md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Payment ID</p>
                      <p className="font-mono text-sm bg-background/50 p-2 rounded-lg">
                        {order.paymentDetails.razorpayPaymentId}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Delivery Timeline */}
          {order.estimatedDelivery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Card className="rounded-3xl border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Estimated Delivery</p>
                      <p className="font-semibold">
                        {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {order.deliveredAt && (
                      <div className="p-4 rounded-2xl bg-green-500/10">
                        <p className="text-xs text-muted-foreground mb-1">Delivered On</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Cancel Order Button */}
          {!['cancelled', 'delivered', 'shipped'].includes(order.orderStatus) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="rounded-3xl border-red-200/50 dark:border-red-800/50 overflow-hidden bg-red-50/50 dark:bg-red-950/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-red-700 dark:text-red-400">Cancel Order</h3>
                        <p className="text-sm text-muted-foreground">
                          You can cancel this order if it hasn't been shipped yet.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleCancelOrder}
                      disabled={isCancelling}
                      className="rounded-full px-6"
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
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
