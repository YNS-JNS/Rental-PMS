import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Button onClick={() => navigate('/dashboard')} className="mt-4">
        Return to Dashboard
      </Button>
    </div>
  );
}
