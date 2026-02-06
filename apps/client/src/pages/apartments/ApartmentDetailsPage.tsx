import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetApartmentQuery } from '@/features/apartments/apartmentsApiSlice';
import { ArrowLeft, Pencil, MapPin, Building2, CheckCircle2 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ApartmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Skip query if no ID
  const { data: apartment, isLoading, isError } = useGetApartmentQuery(id || '', {
    skip: !id
  });

  if (isLoading) return <div className="p-10 text-center">Loading details...</div>;
  if (isError || !apartment) return (
    <div className="p-10 text-center space-y-4">
      <h3 className="text-lg font-medium text-destructive">Property not found</h3>
      <Button onClick={() => navigate('/apartments')}>Back to List</Button>
    </div>
  );

  const hasImages = apartment.images && apartment.images.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/apartments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{apartment.name}</h2>
            <div className="flex items-center space-x-2 mt-1">
               <Badge variant={apartment.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                {apartment.status}
              </Badge>
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                ID: {apartment._id}
              </span>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link to={`/apartments/${apartment._id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Property
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Image Gallery */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-none bg-transparent">
            {hasImages ? (
               <Carousel className="w-full">
                 <CarouselContent>
                   {apartment.images!.map((image, index) => (
                     <CarouselItem key={index}>
                       <div className="p-1">
                         <div className="aspect-video relative overflow-hidden rounded-xl border bg-slate-100">
                           <img 
                             src={image} 
                             alt={`${apartment.name} view ${index + 1}`} 
                             className="object-cover w-full h-full"
                           />
                         </div>
                       </div>
                     </CarouselItem>
                   ))}
                 </CarouselContent>
                 {/* Show navigation arrows only if more than 1 image */}
                 {apartment.images!.length > 1 && (
                   <>
                     <CarouselPrevious className="left-2" />
                     <CarouselNext className="right-2" />
                   </>
                 )}
               </Carousel>
            ) : (
              <div className="aspect-video w-full bg-slate-100 flex flex-col items-center justify-center rounded-xl border text-muted-foreground">
                <Building2 className="h-16 w-16 mb-2 opacity-20" />
                <span>No Images Available</span>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Rent</span>
                <span className="text-2xl font-bold text-primary">
                  ${apartment.price.toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{apartment.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Description & Facilities */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {apartment.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              {apartment.facilities && apartment.facilities.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {apartment.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{facility}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specific facilities listed.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}