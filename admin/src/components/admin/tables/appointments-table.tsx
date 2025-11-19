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
import { Loader2, Eye, Edit, Trash2, Calendar, User, DollarSign } from "lucide-react"
import { appointmentsService } from "@/lib/services/appointments.service"
import { Appointment } from "@/types/appointment"
import { toast } from "sonner"

function getStatusColor(status: string) {
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

export function AppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Filters
  const [status, setStatus] = useState<string>("")
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Edit form
  const [editStatus, setEditStatus] = useState("")
  const [editPaymentStatus, setEditPaymentStatus] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editPrescription, setEditPrescription] = useState("")

  // Stats
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  })

  useEffect(() => {
    fetchAppointments()
  }, [status, paymentStatus, startDate, endDate])

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (status) params.status = status
      if (paymentStatus) params.paymentStatus = paymentStatus
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await appointmentsService.getAllAppointments(params)
      setAppointments(response.data.appointments)
      setStats(response.data.stats)
    } catch (error: any) {
      console.error('Failed to fetch appointments:', error)
      toast.error(error.response?.data?.message || 'Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setEditStatus(appointment.status)
    setEditPaymentStatus(appointment.paymentStatus)
    setEditNotes(appointment.notes || "")
    setEditPrescription(appointment.prescription || "")
    setIsEditDialogOpen(true)
  }

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return

    setIsUpdating(true)
    try {
      await appointmentsService.updateAppointment(selectedAppointment._id, {
        status: editStatus as any,
        paymentStatus: editPaymentStatus as any,
        notes: editNotes,
        prescription: editPrescription,
      })
      toast.success('Appointment updated successfully')
      setIsEditDialogOpen(false)
      fetchAppointments()
    } catch (error: any) {
      console.error('Failed to update appointment:', error)
      toast.error(error.response?.data?.message || 'Failed to update appointment')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAppointment) return

    setIsUpdating(true)
    try {
      await appointmentsService.deleteAppointment(selectedAppointment._id)
      toast.success('Appointment deleted successfully')
      setIsDeleteDialogOpen(false)
      fetchAppointments()
    } catch (error: any) {
      console.error('Failed to delete appointment:', error)
      toast.error(error.response?.data?.message || 'Failed to delete appointment')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredAppointments = useMemo(() => {
    if (!search) return appointments

    return appointments.filter((appointment) => {
      const searchLower = search.toLowerCase()
      return (
        appointment.patientId.fullName.toLowerCase().includes(searchLower) ||
        appointment.patientId.email.toLowerCase().includes(searchLower) ||
        appointment.doctorId.userId.fullName.toLowerCase().includes(searchLower) ||
        appointment._id.toLowerCase().includes(searchLower)
      )
    })
  }, [appointments, search])

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedAppointments}</div>
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.pendingPayments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
            <Input
              placeholder="Search patients, doctors..."
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
            <Select value={status || undefined} onValueChange={(val) => setStatus(val === "all" ? "" : val)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
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
                    <TableHead>Patient</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No appointments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{appointment.patientId.fullName}</div>
                            <div className="text-xs text-muted-foreground">{appointment.patientId.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{appointment.patientId.phoneNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{appointment.doctorId.userId.fullName}</div>
                            <div className="text-xs text-muted-foreground">{appointment.doctorId.specialization}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">{appointment.appointmentTime}</div>
                          </div>
                        </TableCell>
                        <TableCell>₹{appointment.consultationFee}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                            {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(appointment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(appointment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(appointment)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Complete information about the appointment</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Patient Name</Label>
                  <p className="font-medium">{selectedAppointment.patientId.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Patient Email</Label>
                  <p className="font-medium">{selectedAppointment.patientId.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Patient Mobile</Label>
                  <p className="font-medium">{selectedAppointment.patientId.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Doctor Name</Label>
                  <p className="font-medium">{selectedAppointment.doctorId.userId.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Specialization</Label>
                  <p className="font-medium">{selectedAppointment.doctorId.specialization}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">{selectedAppointment.appointmentTime}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Consultation Fee</Label>
                  <p className="font-medium">₹{selectedAppointment.consultationFee}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{selectedAppointment.duration} minutes</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="font-medium">{selectedAppointment.reason}</p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}
              {selectedAppointment.prescription && (
                <div>
                  <Label className="text-muted-foreground">Prescription</Label>
                  <p className="font-medium">{selectedAppointment.prescription}</p>
                </div>
              )}
              <div className="flex gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedAppointment.status)}>
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Status</Label>
                  <div className="mt-1">
                    <Badge className={getPaymentStatusColor(selectedAppointment.paymentStatus)}>
                      {selectedAppointment.paymentStatus.charAt(0).toUpperCase() + selectedAppointment.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment status and details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Appointment Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
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
              <Label>Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes..."
              />
            </div>
            <div>
              <Label>Prescription</Label>
              <Textarea
                value={editPrescription}
                onChange={(e) => setEditPrescription(e.target.value)}
                placeholder="Add prescription..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAppointment} disabled={isUpdating}>
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
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
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
