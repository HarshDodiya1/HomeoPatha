'use client';

import { useEffect, useState } from 'react';
import { useUsersStore } from '@/store/users.store';
import { UserTable } from '@/components/users/user-table';
import { UserDetailDialog } from '@/components/users/user-detail-dialog';
import { UserEditDialog, UpdateUserData } from '@/components/users/user-edit-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User, UserRoleEnum } from '@/types/auth';
import { Loader2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientsPage() {
  const {
    filteredUsers,
    isLoading,
    searchQuery,
    fetchAllUsers,
    setSearchQuery,
    setSelectedUserType,
    updateUser,
    deleteUser,
  } = useUsersStore();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSelectedUserType(UserRoleEnum.PATIENT);
    fetchAllUsers();
  }, [fetchAllUsers, setSelectedUserType]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await deleteUser(userToDelete.id);
      toast.success('Patient deleted successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete patient');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveUser = async (id: string, data: UpdateUserData) => {
    try {
      await updateUser(id, data);
      setEditOpen(false);
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground mt-1">
            Manage all patients in the system
          </p>
        </div>
      </div>

      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patients List</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {filteredUsers.length} patients
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <UserDetailDialog
        user={selectedUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* User Edit Dialog */}
      <UserEditDialog
        user={selectedUser}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveUser}
        isLoading={isDeleting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{userToDelete?.fullName || 'this patient'}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
