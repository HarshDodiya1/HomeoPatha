'use client';

import { User } from '@/types/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface UserDetailDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            <p className="text-base font-semibold">{user.username}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{user.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">User Type</p>
            <div className="mt-1">
              <Badge>{user.user_type}</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <div className="mt-1">
              <Badge variant={user.is_active ? 'default' : 'destructive'}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Created</p>
            <p className="text-sm">
              {format(new Date(user.created_at), 'PPP pp')}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
            <p className="text-sm">
              {format(new Date(user.updated_at), 'PPP pp')}
            </p>
          </div>

          {user.last_login && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Login
              </p>
              <p className="text-sm">
                {format(new Date(user.last_login), 'PPP pp')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
