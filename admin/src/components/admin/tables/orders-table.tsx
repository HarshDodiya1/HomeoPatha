"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Eye, Edit, Trash2, ShoppingBag, DollarSign, Package, TrendingUp, FileText } from "lucide-react"
import { ordersService } from "@/lib/services/orders.service"
import { Order } from "@/types/order"
import { toast } from "sonner"

function getStatusColor(status: string) {
  switch (status) {
    case 'payment_failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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

function getPaymentStatusColor(status: string) {
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

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Filters
  const [orderStatus, setOrderStatus] = useState<string>("")
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Edit form
  const [editOrderStatus, setEditOrderStatus] = useState("")
  const [editPaymentStatus, setEditPaymentStatus] = useState("")
  const [editAdminNotes, setEditAdminNotes] = useState("")
  const [editEstimatedDelivery, setEditEstimatedDelivery] = useState("")
  const [editShippingCharges, setEditShippingCharges] = useState("")

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  })

  useEffect(() => {
    fetchOrders()
  }, [orderStatus, paymentStatus, paymentMethod, startDate, endDate])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (orderStatus) params.orderStatus = orderStatus
      if (paymentStatus) params.paymentStatus = paymentStatus
      if (paymentMethod) params.paymentMethod = paymentMethod
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await ordersService.getAllOrders(params)
      setOrders(response.data.data.orders)
      setStats(response.data.data.stats)
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      toast.error(error.response?.data?.message || 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (order: Order) => {
    setSelectedOrder(order)
    setEditOrderStatus(order.orderStatus)
    setEditPaymentStatus(order.paymentStatus)
    setEditAdminNotes(order.adminNotes || "")
    setEditEstimatedDelivery(order.estimatedDelivery || "")
    setEditShippingCharges(String(order.shippingCharges || 0))
    setIsEditDialogOpen(true)
  }

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    setIsUpdating(true)
    try {
      await ordersService.updateOrderStatus(selectedOrder._id, {
        orderStatus: editOrderStatus as any,
        adminNotes: editAdminNotes,
        estimatedDelivery: editEstimatedDelivery,
        shippingCharges: Number(editShippingCharges) || 0,
      })

      if (editPaymentStatus !== selectedOrder.paymentStatus) {
        await ordersService.updatePaymentStatus(selectedOrder._id, {
          paymentStatus: editPaymentStatus as any,
        })
      }

      toast.success('Order updated successfully')
      setIsEditDialogOpen(false)
      fetchOrders()
    } catch (error: any) {
      console.error('Failed to update order:', error)
      toast.error(error.response?.data?.message || 'Failed to update order')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (order: Order) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return

    setIsUpdating(true)
    try {
      await ordersService.deleteOrder(selectedOrder._id)
      toast.success('Order deleted successfully')
      setIsDeleteDialogOpen(false)
      fetchOrders()
    } catch (error: any) {
      console.error('Failed to delete order:', error)
      toast.error(error.response?.data?.message || 'Failed to delete order')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewInvoice = async (order: Order) => {
    if (order.orderStatus === 'cancelled') {
      toast.error('Invoice not available for cancelled orders')
      return
    }

    try {
      toast.info('Generating invoice...')
      const response = await ordersService.getOrderInvoice(order._id)
      const htmlContent = response.data
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(htmlContent)
        newWindow.document.close()
      } else {
        toast.error('Please allow popups to view the invoice')
      }
    } catch (error: any) {
      console.error('Failed to generate invoice:', error)
      toast.error(error.response?.data?.message || 'Failed to generate invoice')
    }
  }

  const filteredOrders = useMemo(() => {
    if (!search) return orders

    return orders.filter((order) => {
      const searchLower = search.toLowerCase()
      return (
        order.userId.fullName.toLowerCase().includes(searchLower) ||
        order.userId.email.toLowerCase().includes(searchLower) ||
        order._id.toLowerCase().includes(searchLower)
      )
    })
  }, [orders, search])

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.pendingPayments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Select value={orderStatus || undefined} onValueChange={(val) => setOrderStatus(val === "all" ? "" : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="payment_failed">Payment Failed</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatus || undefined} onValueChange={(val) => setPaymentStatus(val === "all" ? "" : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentMethod || undefined} onValueChange={(val) => setPaymentMethod(val === "all" ? "" : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="razorpay">Online</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.userId.fullName}</div>
                            <div className="text-xs text-muted-foreground">{order.userId.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.userId.phoneNumber}</div>
                        </TableCell>
                        <TableCell>{order.orderItems.length} items</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>₹{order.totalAmount}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.orderStatus)}>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.orderStatus !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewInvoice(order)}
                                title="View Invoice"
                              >
                                <FileText className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(order)}
                              title="Edit Order"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(order)}
                              title="Delete Order"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>Complete information about the order</DialogDescription>
              </div>
              {selectedOrder && selectedOrder.orderStatus !== 'cancelled' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewInvoice(selectedOrder)}
                  className="ml-4"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Invoice
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Customer Name</Label>
                  <p className="font-medium">{selectedOrder.userId.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Customer Email</Label>
                  <p className="font-medium">{selectedOrder.userId.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Customer Mobile</Label>
                  <p className="font-medium">{selectedOrder.userId.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Order Date</Label>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 block">Shipping Address</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                  <p>{selectedOrder.shippingAddress.pincode}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 block">Order Items</Label>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item._id} className="flex justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.shippingCharges > 0 && (
                <div className="flex justify-between items-center pt-4 border-t text-sm text-muted-foreground">
                  <span>Shipping Charges</span>
                  <span className="font-medium">₹{selectedOrder.shippingCharges}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="text-lg font-semibold">Total Amount</span>
                  <p className="text-xs text-muted-foreground">All taxes included</p>
                </div>
                <span className="text-2xl font-bold text-primary">₹{selectedOrder.totalAmount}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="font-medium">{selectedOrder.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Status</Label>
                  <div className="mt-1">
                    <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedOrder.adminNotes && (
                <div>
                  <Label className="text-muted-foreground">Admin Notes</Label>
                  <p className="font-medium">{selectedOrder.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
            <DialogDescription>Update order and payment status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Order Status</Label>
              <Select value={editOrderStatus} onValueChange={setEditOrderStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="payment_failed">Payment Failed</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estimated Delivery</Label>
              <Input
                type="date"
                value={editEstimatedDelivery}
                onChange={(e) => setEditEstimatedDelivery(e.target.value)}
              />
            </div>
            <div>
              <Label>Shipping Charges (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editShippingCharges}
                onChange={(e) => setEditShippingCharges(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={editAdminNotes}
                onChange={(e) => setEditAdminNotes(e.target.value)}
                placeholder="Add notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
