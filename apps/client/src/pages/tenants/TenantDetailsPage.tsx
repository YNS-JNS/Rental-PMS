import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetTenantQuery, useDeleteTenantMutation } from '@/features/tenants/tenantsApiSlice';
import { useState } from 'react';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Calendar, FileText, CreditCard } from 'lucide-react';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Custom Components
import { ConfirmModal } from '@/components/common/ConfirmModal';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TenantDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: tenant, isLoading, isError } = useGetTenantQuery(id!);
  const [deleteTenant, { isLoading: isDeleting }] = useDeleteTenantMutation();

  const handleDelete = async () => {
    try {
      await deleteTenant(id!).unwrap();
      toast({
        title: "Tenant Deleted",
        description: "The tenant has been removed from your records.",
      });
      navigate('/tenants');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the tenant. Please try again.",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading tenant details...</div>;
  if (isError || !tenant) return <div className="p-8 text-center text-red-500">Failed to load tenant.</div>;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {tenant.firstName} {tenant.lastName}
              </h2>
              <p className="text-muted-foreground">Tenant Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/tenants/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(tenant.firstName, tenant.lastName)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">
                  {tenant.firstName} {tenant.lastName}
                </h3>
                <Badge 
                  variant={tenant.isActive !== false ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {tenant.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{tenant.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{tenant.phone || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CIN / Passport</p>
                  <p className="font-medium">{tenant.cinPassport || '—'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered On</p>
                  <p className="font-medium">{formatDate(tenant.createdAt)}</p>
                </div>
              </div>

              {tenant.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-medium whitespace-pre-wrap">{tenant.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Tenant"
        description="Are you sure you want to delete this tenant? This action cannot be undone."
        confirmText="Delete Tenant"
        variant="destructive"
      />
    </>
  );
}
