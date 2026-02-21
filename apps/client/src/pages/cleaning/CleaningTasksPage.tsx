import { useGetCleaningTasksQuery, useMarkAsCleanMutation } from '@/features/cleaning/cleaningApiSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, MapPin, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

/**
 * CleaningTasksPage
 * Mobile-first, large cards with big "Mark as Clean" buttons.
 * Designed for cleaners on smartphones.
 */
export default function CleaningTasksPage() {
  const { data: tasks, isLoading, isError } = useGetCleaningTasksQuery();
  const [markAsClean, { isLoading: isMarking }] = useMarkAsCleanMutation();

  const handleMarkClean = async (bookingId: string) => {
    try {
      await markAsClean(bookingId).unwrap();
    } catch {
      // Silently fail — cache will re-fetch
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-red-600">Failed to load tasks</p>
        <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sparkles className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">All clean! ✨</h2>
        <p className="text-muted-foreground mt-2">No apartments need cleaning right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-medium">
        {tasks.length} apartment{tasks.length !== 1 ? 's' : ''} to clean
      </p>
      
      {tasks.map((task) => (
        <Card key={task._id} className="border-l-4 border-l-orange-400 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">
              {task.apartment?.name || 'Unknown Apartment'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {task.apartment?.address && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                {task.apartment.address}
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
              Checkout: {format(new Date(task.endDate), 'dd/MM/yyyy')}
            </div>
            
            <Button
              onClick={() => handleMarkClean(task._id)}
              disabled={isMarking}
              className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white mt-2"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-6 w-6" />
              Mark as Clean
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
