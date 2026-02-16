"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  Plus,
  Trash2,
  UserCircle,
  MapPin,
  ShoppingCart,
  IndianRupee,
  FileText,
  ArrowLeft,
  Printer,
} from "lucide-react"
import { toast } from "sonner"
import { ordersService } from "@/lib/services/orders.service"

interface OrderItem {
  title: string
  quantity: number
  price: number
}

export function CreateInvoiceForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pincode, setPincode] = useState("")

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { title: "", quantity: 1, price: 0 },
  ])

  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [paymentStatus, setPaymentStatus] = useState("completed")
  const [orderStatus, setOrderStatus] = useState("confirmed")
  const [adminNotes, setAdminNotes] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")

  const addOrderItem = () => {
    setOrderItems([...orderItems, { title: "", quantity: 1, price: 0 }])
  }

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index))
    }
  }

  const updateOrderItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const updated = [...orderItems]
    updated[index] = { ...updated[index], [field]: value }
    setOrderItems(updated)
  }

  const calculateTotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !customerName ||
      !customerPhone ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    if (
      orderItems.some(
        (item) => !item.title || item.quantity <= 0 || item.price <= 0
      )
    ) {
      toast.error("All items need a name, valid quantity and price")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await ordersService.createManualOrder({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: { addressLine1, addressLine2, city, state, pincode },
        orderItems,
        paymentMethod,
        paymentStatus,
        orderStatus,
        adminNotes,
        estimatedDelivery: estimatedDelivery || undefined,
      })

      toast.success("Invoice created successfully!")

      const orderId = response.data.data.order._id
      const invoiceResponse = await ordersService.getOrderInvoice(orderId)
      const htmlContent = invoiceResponse.data
      const newWindow = window.open("", "_blank")
      if (newWindow) {
        newWindow.document.write(htmlContent)
        newWindow.document.close()
      }

      setTimeout(() => {
        router.push("/admin/orders")
      }, 1000)
    } catch (error: any) {
      console.error("Failed to create invoice:", error)
      toast.error(
        error.response?.data?.message || "Failed to create invoice"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = calculateTotal()

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary" />
                Customer
              </CardTitle>
              <CardDescription>Who is this invoice for?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ravi Sharma"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Address Line 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House / Street"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Address Line 2</Label>
                <Input
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, floor, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Pincode <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400001"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Notes & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Estimated Delivery</Label>
                <Input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Internal Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Anything to remember..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Order Items
                  </CardTitle>
                  <CardDescription>Add products to this invoice</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addOrderItem}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_80px_110px_100px_40px] gap-3 px-6 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-y">
                <span>Product</span>
                <span className="text-center">Qty</span>
                <span className="text-center">Price (₹)</span>
                <span className="text-right">Total</span>
                <span />
              </div>

              {/* Item Rows */}
              <div className="divide-y">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_80px_110px_100px_40px] gap-3 px-6 py-3 items-center"
                  >
                    <Input
                      value={item.title}
                      onChange={(e) =>
                        updateOrderItem(index, "title", e.target.value)
                      }
                      placeholder="Product name"
                      className="h-9"
                      required
                    />
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateOrderItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="h-9 text-center"
                      required
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price || ""}
                      onChange={(e) =>
                        updateOrderItem(
                          index,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-9 text-center"
                      required
                    />
                    <div className="text-right font-medium text-sm tabular-nums">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="flex justify-center">
                      {orderItems.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeOrderItem(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <div className="h-7 w-7" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add row */}
              <button
                type="button"
                onClick={addOrderItem}
                className="w-full px-6 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t border-dashed flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3 w-3" />
                Add another item
              </button>
            </CardContent>
          </Card>

          {/* Payment & Status */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" />
                Payment & Status
              </CardTitle>
              <CardDescription>Set payment and order status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">Cash</SelectItem>
                      <SelectItem value="razorpay">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Status</Label>
                  <Select
                    value={paymentStatus}
                    onValueChange={setPaymentStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Order Status</Label>
                  <Select
                    value={orderStatus}
                    onValueChange={setOrderStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary + Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Invoice Total
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">
                      ₹{total.toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {orderItems.length}{" "}
                      {orderItems.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/orders")}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Printer className="h-4 w-4 mr-2" />
                    )}
                    Create & Print Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
