import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Building2 } from 'lucide-react';
import { useGetApartmentsQuery, useDeleteApartmentMutation } from '@/features/apartments/apartmentsApiSlice';
import { formatCurrency } from '@/lib/formatCurrency';
import { IApartment } from '@rental/shared';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Custom Components (Le Modal)
import { ConfirmModal } from '@/components/common/ConfirmModal';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export default function ApartmentsPage() {
  const { toast } = useToast();
  
  // --- STATE ---
  // Stocke l'ID de l'appartement à supprimer.
  // Si null, le modal est fermé. Si rempli, le modal est ouvert.
  const [apartmentIdToDelete, setApartmentIdToDelete] = useState<string | null>(null);
  
  // --- API ---
  const { data: apartments, isLoading, isError } = useGetApartmentsQuery();
  const [deleteApartment, { isLoading: isDeleting }] = useDeleteApartmentMutation();

  // 1. Déclencheur (Ouvre le modal)
  const initiateDelete = (id: string) => {
    setApartmentIdToDelete(id);
  };

  // 2. Action Confirmée (Exécutée quand on clique sur "Delete Property" dans le modal)
  const handleDeleteConfirmed = async () => {
    if (!apartmentIdToDelete) return;

    try {
      await deleteApartment(apartmentIdToDelete).unwrap();
      toast({
        title: "Property Deleted",
        description: "The apartment has been removed from your listings.",
      });
      // Fermer le modal
      setApartmentIdToDelete(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the property. Please try again.",
      });
    }
  };

  // --- RENDERING HELPERS ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'default';
      case 'RENTED': return 'secondary';
      case 'MAINTENANCE': return 'destructive';
      default: return 'outline';
    }
  };

  const formatPrice = (price: number) => {
    return formatCurrency(price);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading properties...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load properties.</div>;

  return (
    <>
      {/* --- PAGE CONTENT --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
            <p className="text-muted-foreground">
              Manage your rental portfolio ({apartments?.length || 0} units)
            </p>
          </div>
          <Button asChild>
            <Link to="/apartments/new">
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Properties</CardTitle>
            <CardDescription>
              A detailed list of your properties. Use the actions menu to manage each unit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apartments?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No properties found. <br />
                      <Link to="/apartments/new" className="text-primary hover:underline">
                        Create your first property
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
                
                {apartments?.map((apartment: IApartment) => (
                  <TableRow key={apartment._id}>
                    <TableCell>
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage 
                          src={apartment.images && apartment.images.length > 0 ? apartment.images[0] : ''} 
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-md bg-muted">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{apartment.name}</span>
                        <span className="md:hidden text-xs text-muted-foreground">{apartment.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {apartment.address}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(apartment.status) as any}>
                        {apartment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(apartment.price)}
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
                            <Link to={`/apartments/${apartment._id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/apartments/${apartment._id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* ICI : On appelle initiateDelete au lieu de handleDelete direct.
                              Pas de window.confirm.
                          */}
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => initiateDelete(apartment._id)}
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

      {/* --- CONFIRMATION MODAL --- */}
      {/* Rendu conditionnel ou via props isOpen */}
      <ConfirmModal
        isOpen={!!apartmentIdToDelete}
        onClose={() => setApartmentIdToDelete(null)}
        onConfirm={handleDeleteConfirmed}
        loading={isDeleting}
        title="Delete Property"
        description="Are you sure you want to delete this property? This action cannot be undone and will remove all associated data."
        confirmText="Delete Property"
        variant="destructive"
      />
    </>
  );
}