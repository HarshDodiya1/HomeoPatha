"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Plus } from "lucide-react"
import { toast } from "sonner"
import { useDoctorsStore } from "@/store/doctors.store"
import { DoctorCard } from "@/components/admin/cards/doctor-card"
import { AddDoctorDialog } from "@/components/admin/dialogs/add-doctor-dialog"
import { EditDoctorDialog } from "@/components/admin/dialogs/edit-doctor-dialog"
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
  const { doctors, isLoadingDoctors, doctorsError, fetchDoctors, deleteDoctor } = useDoctorsStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDoctors, setFilteredDoctors] = useState<typeof doctors>([])
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [isDeletingDoctor, setIsDeletingDoctor] = useState(false)
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
            d.userId?.fullName?.toLowerCase().includes(lowerSearch) ||
            d.specialization?.toLowerCase().includes(lowerSearch) ||
            d.user?.email?.toLowerCase().includes(lowerSearch) ||
            d.userId?.email?.toLowerCase().includes(lowerSearch)
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
      setIsDeletingDoctor(true)
      const doctorId = selectedDoctor.id || selectedDoctor._id
      await deleteDoctor(doctorId)
      toast.success("Doctor deleted successfully")
      setDeleteDialog(false)
      setSelectedDoctor(null)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete doctor"
      toast.error(errorMessage)
    } finally {
      setIsDeletingDoctor(false)
    }
  }

  const handleEditClick = (doctor: any) => {
    setSelectedDoctor(doctor)
    setEditDialogOpen(true)
  }

  const handleAddSuccess = async () => {
    await fetchDoctors()
  }

  const handleEditSuccess = async () => {
    setEditDialogOpen(false)
    setSelectedDoctor(null)
    await fetchDoctors()
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Doctors Management</CardTitle>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Doctor
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialization, or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoadingDoctors ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No doctors found</p>
              <p className="text-sm mt-1">
                {searchTerm ? "Try adjusting your search" : "Add your first doctor to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor: any) => (
                <DoctorCard
                  key={doctor.id || doctor._id}
                  doctor={doctor}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddDoctorDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
      />

      {selectedDoctor && (
        <EditDoctorDialog
          doctor={selectedDoctor}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDoctor?.userId?.fullName || selectedDoctor?.user?.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isDeletingDoctor}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeletingDoctor}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingDoctor ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
