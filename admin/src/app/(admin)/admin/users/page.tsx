'use client';

import { useEffect, useState } from 'react';
import { useUsersStore } from '@/store/users.store';
import { UserTable } from '@/components/users/user-table';
import { UserDetailDialog } from '@/components/users/user-detail-dialog';
import { UserEditDialog, UpdateUserData } from '@/components/users/user-edit-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersPage() {
  const {
    filteredUsers,
    isLoading,
    searchQuery,
    selectedUserType,
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
    fetchAllUsers();
  }, [fetchAllUsers]);

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
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
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
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage and view all users in the system
        </p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                className="pl-10"
              />
            </div>

            {/* Filter by User Type */}
            <Select
              value={selectedUserType}
              onValueChange={(value) =>
                setSelectedUserType(value as UserRoleEnum | 'ALL')
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Users</SelectItem>
                <SelectItem value={UserRoleEnum.SUPERADMIN}>Admin</SelectItem>
                <SelectItem value={UserRoleEnum.DOCTOR}>Doctors</SelectItem>
                <SelectItem value={UserRoleEnum.PATIENT}>Patients</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users List</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {filteredUsers.length} users
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
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{userToDelete?.fullName || 'this user'}</span>?
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
