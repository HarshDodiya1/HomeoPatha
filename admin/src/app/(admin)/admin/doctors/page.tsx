"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Search, Trash2, Edit, Phone, Mail } from "lucide-react"
import { toast } from "sonner"
import { useDoctorsStore } from "@/store/doctors.store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DoctorsPage() {
  const { doctors, isLoadingDoctors, doctorsError, fetchDoctors } = useDoctorsStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDoctors, setFilteredDoctors] = useState<typeof doctors>([])
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchDoctors()
  }, [fetchDoctors])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredDoctors(doctors)
    } else {
      const lowerSearch = searchTerm.toLowerCase()
      setFilteredDoctors(
        doctors.filter(
          (d: any) =>
            d.user?.fullName?.toLowerCase().includes(lowerSearch) ||
            d.specialization?.toLowerCase().includes(lowerSearch) ||
            d.user?.email?.toLowerCase().includes(lowerSearch)
        )
      )
    }
  }, [searchTerm, doctors])

  const handleDeleteClick = (doctor: any) => {
    setSelectedDoctor(doctor)
    setDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      // TODO: Implement delete API call when backend ready
      toast.success("Doctor deleted successfully")
      setDeleteDialog(false)
      setSelectedDoctor(null)
      await fetchDoctors()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete doctor"
      toast.error(errorMessage)
    }
  }

  const getDoctorInitials = (name?: string) => {
    if (!name) return "DR"
    return name
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (doctorsError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">{doctorsError}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Doctors Management</CardTitle>
          <Link href="/admin/doctors/new">
            <Button>Add Doctor</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialization, or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            {isLoadingDoctors ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p>No doctors found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor: any) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getDoctorInitials(doctor.user?.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{doctor.user?.fullName || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{doctor.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.specialization || "N/A"}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {doctor.user?.phoneNumber && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {doctor.user.phoneNumber}
                            </div>
                          )}
                          {doctor.user?.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {doctor.user.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doctor.user?.isActive ? "default" : "destructive"}>
                          {doctor.user?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/doctors/${doctor.id}/edit`}>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(doctor)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDoctor?.user?.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
