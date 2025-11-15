'use client';

import { useState } from 'react';
import { User, UserTypeEnum } from '@/types/auth';
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
  username?: string;
  email?: string;
  password?: string;
  user_type?: string;
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    user_type: user?.user_type || UserTypeEnum.PATIENT,
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
    if (!formData.username || !formData.email) {
      setError('Username and email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Only send fields that were changed
      const dataToSend: UpdateUserData = {
        username: formData.username !== user.username ? formData.username : undefined,
        email: formData.email !== user.email ? formData.email : undefined,
        password: formData.password || undefined,
        user_type: formData.user_type !== user.user_type ? formData.user_type : undefined,
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
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.currentTarget.value)}
              placeholder="Enter username"
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
            <Label htmlFor="password">Password (leave blank to keep current)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.currentTarget.value)}
              placeholder="Enter new password"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="user_type">User Type</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value) => handleChange('user_type', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="user_type">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserTypeEnum.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserTypeEnum.DOCTOR}>Doctor</SelectItem>
                <SelectItem value={UserTypeEnum.PATIENT}>Patient</SelectItem>
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
