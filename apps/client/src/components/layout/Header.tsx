import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

export default function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden mr-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar className="h-full" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo / Brand (Visible on mobile if needed, or handled by Sidebar on desktop) */}
        <div className="md:hidden font-bold text-lg">
          Rental PMS
        </div>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  );
}