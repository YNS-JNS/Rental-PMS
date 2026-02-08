import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Mail, Phone } from 'lucide-react';
import { useGetTenantsQuery, useDeleteTenantMutation } from '@/features/tenants/tenantsApiSlice';
import { ITenant } from '@rental/shared';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Custom Components
import { ConfirmModal } from '@/components/common/ConfirmModal';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TenantsPage() {
  const { toast } = useToast();
  
  // State for delete confirmation
  const [tenantIdToDelete, setTenantIdToDelete] = useState<string | null>(null);
  
  // API
  const { data: tenants, isLoading, isError } = useGetTenantsQuery();
  const [deleteTenant, { isLoading: isDeleting }] = useDeleteTenantMutation();

  const initiateDelete = (id: string) => {
    setTenantIdToDelete(id);
  };

  const handleDeleteConfirmed = async () => {
    if (!tenantIdToDelete) return;

    try {
      await deleteTenant(tenantIdToDelete).unwrap();
      toast({
        title: "Tenant Deleted",
        description: "The tenant has been removed from your records.",
      });
      setTenantIdToDelete(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the tenant. Please try again.",
      });
    }
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading tenants...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load tenants.</div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
            <p className="text-muted-foreground">
              Manage your tenant records ({tenants?.length || 0} total)
            </p>
          </div>
          <Button asChild>
            <Link to="/tenants/new">
              <Plus className="mr-2 h-4 w-4" /> Add Tenant
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tenants</CardTitle>
            <CardDescription>
              A list of all registered tenants. Use the actions menu to manage each record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No tenants found. <br />
                      <Link to="/tenants/new" className="text-primary hover:underline">
                        Add your first tenant
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
                
                {tenants?.map((tenant: ITenant) => (
                  <TableRow key={tenant._id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(tenant.firstName, tenant.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{tenant.firstName} {tenant.lastName}</span>
                        <span className="md:hidden text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {tenant.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {tenant.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {tenant.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {tenant.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tenant.isActive !== false ? 'default' : 'secondary'}>
                        {tenant.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/tenants/${tenant._id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/tenants/${tenant._id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => initiateDelete(tenant._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!tenantIdToDelete}
        onClose={() => setTenantIdToDelete(null)}
        onConfirm={handleDeleteConfirmed}
        loading={isDeleting}
        title="Delete Tenant"
        description="Are you sure you want to delete this tenant? This action cannot be undone."
        confirmText="Delete Tenant"
        variant="destructive"
      />
    </>
  );
}
