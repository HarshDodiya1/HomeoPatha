"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Loader2, ShoppingCart, CreditCard, Truck } from "lucide-react"
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
  const { cart, fetchCart } = useCartStore()
  
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

  const totalAmount = cart?.items.reduce((sum, item) => 
    sum + (item.product?.currentPrice || 0) * item.quantity, 0
  ) || 0

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
      })

      const responseData = createResponse.data.data

      // For COD, order is complete
      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!')
        router.push(`/orders/${responseData.orderId}`)
        return
      }

      // For Razorpay, continue with payment
      const { orderId, razorpayOrderId, amount } = responseData

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.')
        setIsProcessing(false)
        return
      }

      // Configure Razorpay options
      const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'HomeoPatha',
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
          color: '#10b981',
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some products to checkout</p>
              <Button onClick={() => router.push('/products')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    placeholder="Street address, building name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                    placeholder="Apartment, suite, unit (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'razorpay' | 'cod')}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                      <div className="font-medium">Online Payment (Razorpay)</div>
                      <div className="text-sm text-muted-foreground">Pay securely using UPI, Cards, Net Banking</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-muted-foreground">Pay when you receive the order</div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
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
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold">₹{((item.product?.currentPrice || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order
                      <span className="ml-2">₹{totalAmount.toFixed(2)}</span>
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
