import { useState } from 'react';
import { useGetStaffQuery, useCreateStaffMutation, useDeleteStaffMutation, useUpdateStaffMutation } from '@/features/staff/staffApiSlice';
import { UserRole } from '@rental/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Trash2, UserPlus, Shield, ShieldCheck, Paintbrush } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const roleBadgeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Shield }> = {
  [UserRole.SUPER_ADMIN]: { label: 'Super Admin', variant: 'destructive', icon: ShieldCheck },
  [UserRole.ADMIN]: { label: 'Admin', variant: 'default', icon: Shield },
  [UserRole.CLEANER]: { label: 'Cleaner', variant: 'secondary', icon: Paintbrush },
};

export default function StaffSettingsPage() {
  const { data: staff, isLoading } = useGetStaffQuery();
  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>(UserRole.ADMIN);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole(UserRole.ADMIN);
  };

  const handleCreate = async () => {
    if (!name || !email || !password) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    try {
      await createStaff({ name, email, password, role }).unwrap();
      toast({ title: 'Staff member created', description: `${name} has been added.` });
      resetForm();
      setOpen(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.data?.message || 'Failed to create staff member', variant: 'destructive' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStaff(deleteTarget.id).unwrap();
      toast({ title: 'Deleted', description: `${deleteTarget.name} has been removed.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.data?.message || 'Failed to delete', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateStaff({ id, data: { role: newRole } }).unwrap();
      toast({ title: 'Role updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.data?.message || 'Failed to update role', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Staff Management</CardTitle>
          <CardDescription>Manage your team members and their roles</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>Create a new account with a temporary password.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Name</Label>
                <Input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-password">Temporary Password</Label>
                <Input id="staff-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRole.CLEANER}>Cleaner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!staff || staff.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No staff members yet. Add your first team member above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {staff.map((member) => {
              const config = roleBadgeConfig[member.role] || roleBadgeConfig[UserRole.ADMIN];
              const Icon = config.icon;
              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Select
                      value={member.role}
                      onValueChange={(newRole) => handleRoleChange(member._id, newRole)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Badge variant={config.variant} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                        <SelectItem value={UserRole.CLEANER}>Cleaner</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteTarget({ id: member._id, name: member.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Delete Confirmation Modal */}
    <ConfirmModal
      isOpen={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      onConfirm={handleDeleteConfirm}
      loading={isDeleting}
      title="Delete Staff Member"
      description={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
      confirmText="Delete"
      variant="destructive"
    />
    </>
  );
}
