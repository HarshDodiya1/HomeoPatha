'use client';

import { useState } from 'react';
import { User, UserRoleEnum } from '@/types/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: UpdateUserData) => Promise<void>;
  isLoading?: boolean;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role || UserRoleEnum.PATIENT,
  });

  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleChange = (field: keyof UpdateUserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!formData.fullName || !formData.email) {
      setError('Full name and email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      // Only send fields that were changed
      const dataToSend: UpdateUserData = {
        fullName: formData.fullName !== user.fullName ? formData.fullName : undefined,
        email: formData.email !== user.email ? formData.email : undefined,
        phoneNumber: formData.phoneNumber !== user.phoneNumber ? formData.phoneNumber : undefined,
        role: formData.role !== user.role ? formData.role : undefined,
      };

      // Remove undefined fields
      Object.keys(dataToSend).forEach(
        (key) =>
          dataToSend[key as keyof UpdateUserData] === undefined &&
          delete dataToSend[key as keyof UpdateUserData]
      );

      await onSave(user.id, dataToSend);
      toast.success('User updated successfully');
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to update user';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.currentTarget.value)}
              placeholder="Enter full name"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.currentTarget.value)}
              placeholder="Enter email"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.currentTarget.value)}
              placeholder="Enter phone number"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRoleEnum.SUPERADMIN}>Super Admin</SelectItem>
                <SelectItem value={UserRoleEnum.DOCTOR}>Doctor</SelectItem>
                <SelectItem value={UserRoleEnum.PATIENT}>Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
