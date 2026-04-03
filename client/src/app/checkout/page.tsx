"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  MapPin, 
  Sparkles, 
  ShoppingBag, 
  Package,
  CheckCircle,
  Shield,
  ArrowRight 
} from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth.store"
import { useCartStore } from "@/store/cart.store"
import { orderService } from "@/lib/services/order.service"
import { loadRazorpayScript } from "@/lib/utils/razorpay"
import Image from "next/image"

interface ShippingAddress {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized, initialize } = useAuthStore()
  const { cart, fetchCart, closeCart } = useCartStore()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay')
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  const subtotal = cart?.items.reduce((sum, item) =>
    sum + (item.product?.currentPrice || 0) * item.quantity, 0
  ) || 0

  const DELIVERY_CHARGE = 60
  const FREE_DELIVERY_THRESHOLD = 499
  const shippingCharges = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE
  const amountForFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal

  const totalAmount = subtotal + shippingCharges

  const handlePlaceOrder = async () => {
    // Validate shipping address
    if (!shippingAddress.addressLine1?.trim() || 
        !shippingAddress.city?.trim() || 
        !shippingAddress.state?.trim() || 
        !shippingAddress.pincode?.trim()) {
      toast.error('Please fill all required address fields')
      return
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Create order on backend
      const createResponse = await orderService.createOrder({
        shippingAddress,
        paymentMethod,
        shippingCharges,
      })

      const responseData = createResponse.data.data

      // For COD, order is complete
      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!')
        await fetchCart() // Refresh cart state
        closeCart() // Close cart sidebar
        router.push(`/orders/${responseData.orderId}`)
        return
      }

      // For Razorpay, continue with payment
      const { orderId, razorpayOrderId, amount, currency, keyId } = responseData

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.')
        setIsProcessing(false)
        return
      }

      // Configure Razorpay options
      const razorpayOptions = {
        key: keyId, // Use key from server response
        amount: amount * 100, // Convert to paise
        currency: currency || 'INR',
        name: 'The HomeoPatha',
        description: 'Product Purchase',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Step 2: Verify payment on backend
            await orderService.verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            toast.success('Payment successful! Order confirmed.')
            await fetchCart() // Refresh cart state
            closeCart() // Close cart sidebar
            router.push(`/orders/${orderId}`)
          } catch (error: any) {
            console.error('Payment verification error:', error)
            toast.error(error.response?.data?.message || 'Payment verification failed')
            setIsProcessing(false)
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phoneNumber || '',
        },
        theme: {
          color: '#22c55e',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
            toast.info('Payment cancelled')
          },
        },
      }

      // Open Razorpay payment modal
      const razorpay = new (window as any).Razorpay(razorpayOptions)
      razorpay.open()
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.response?.data?.message || 'Failed to process checkout')
      setIsProcessing(false)
    }
  }

  if (!isInitialized) {
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen pb-16 pt-28 relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.06),transparent_60%)] -z-10" />
        
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="rounded-3xl border-border/50 overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
                  <ShoppingCart className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">Add some products to checkout</p>
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

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Checkout
            </h1>
          </div>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="rounded-3xl border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    Shipping Address
                  </CardTitle>
                  <CardDescription>Enter your delivery details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1" className="text-sm font-medium">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                      placeholder="Street address, building name"
                      className="h-12 rounded-xl border-border/50 focus:border-primary/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2" className="text-sm font-medium">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                      placeholder="Apartment, suite, unit (optional)"
                      className="h-12 rounded-xl border-border/50 focus:border-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        placeholder="City"
                        className="h-12 rounded-xl border-border/50 focus:border-primary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        placeholder="State"
                        className="h-12 rounded-xl border-border/50 focus:border-primary/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-sm font-medium">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      className="h-12 rounded-xl border-border/50 focus:border-primary/50"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="rounded-3xl border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    Payment Method
                  </CardTitle>
                  <CardDescription>Choose how you want to pay</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'razorpay' | 'cod')}>
                    <div 
                      className={`flex items-center space-x-3 rounded-2xl p-4 cursor-pointer transition-all border-2 ${
                        paymentMethod === 'razorpay' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border/50 hover:border-primary/30 hover:bg-secondary/30'
                      }`}
                    >
                      <RadioGroupItem value="razorpay" id="razorpay" />
                      <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Online Payment</span>
                          <Badge className="bg-primary/10 text-primary border-0 text-xs">Recommended</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">Pay securely using UPI, Cards, Net Banking</div>
                      </Label>
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div 
                      className={`flex items-center space-x-3 rounded-2xl p-4 cursor-pointer transition-all border-2 mt-3 ${
                        paymentMethod === 'cod' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border/50 hover:border-primary/30 hover:bg-secondary/30'
                      }`}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground mt-0.5">Pay when you receive the order</div>
                      </Label>
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative lg:sticky lg:top-24">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[28px] blur-lg opacity-50" />
              <Card className="relative rounded-3xl border-border/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {cart.items.map((item, index) => (
                      <motion.div 
                        key={item._id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        className="flex gap-3 p-3 rounded-xl bg-secondary/30"
                      >
                        <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted shadow-sm">
                          {item.product?.images?.[0] && (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.title || 'Product'}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product?.title}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold text-primary">
                            ₹{((item.product?.currentPrice || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        {shippingCharges > 0 ? (
                          <span className="font-medium">₹{shippingCharges.toFixed(2)}</span>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                            FREE
                          </Badge>
                        )}
                      </div>
                      {shippingCharges > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Add ₹{amountForFreeDelivery.toFixed(2)} more for free delivery
                        </p>
                      )}
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-semibold">Total</span>
                        <p className="text-xs text-muted-foreground">All taxes included</p>
                      </div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePlaceOrder} 
                    disabled={isProcessing}
                    className="w-full rounded-full h-12 shadow-lg shadow-primary/25"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Place Order
                        <span className="ml-2 opacity-80">₹{totalAmount.toFixed(2)}</span>
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing this order, you agree to our Terms & Conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
