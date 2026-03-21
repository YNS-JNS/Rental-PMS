import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

/**
 * Header
 *
 * Sticky top bar with frosted-glass background (Stripe-style).
 * On mobile: hamburger menu triggers the Sidebar in a Sheet.
 * On desktop: only the UserNav action area is visible.
 *
 * Design notes:
 * - `sticky top-0 z-40` ensures it overlays content on scroll.
 * - `bg-background/95 backdrop-blur-sm` creates the frosted-glass effect
 *   without hiding content completely when scrolled.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-4 px-4">

        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar">
              <Sidebar className="h-full" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile brand mark (desktop brand is in the Sidebar wordmark) */}
        <span className="md:hidden font-semibold text-sm tracking-tight">
          Rental PMS
        </span>

        {/* Spacer — pushes UserNav to the right */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <UserNav />
        </div>

      </div>
    </header>
  );
}