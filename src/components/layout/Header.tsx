import { MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg safe-top">
      <div className="container flex items-center justify-between py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <span className="text-lg font-bold text-primary-foreground">B</span>
          </div>
          <span className="font-display text-lg font-bold">BudMat</span>
        </div>

        {/* Location */}
        <button className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm transition-colors hover:bg-secondary/80">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="max-w-[120px] truncate">Warszawa</span>
        </button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  );
}
