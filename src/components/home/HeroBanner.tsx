import { ArrowRight, Truck, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-primary p-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/20" />
      </div>

      <div className="relative z-10">
        <h1 className="mb-2 font-display text-2xl font-bold text-primary-foreground">
          Materiały budowlane
          <br />
          prosto na budowę
        </h1>
        <p className="mb-4 text-sm text-primary-foreground/80">
          Zamów cement, cegły i narzędzia. Dostarczymy w 30 minut!
        </p>

        <Link to="/search">
          <Button
            variant="secondary"
            className="group gap-2 rounded-full bg-white/20 text-primary-foreground backdrop-blur-sm hover:bg-white/30"
          >
            Zamów teraz
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* Features */}
      <div className="relative z-10 mt-6 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-xl bg-white/10 p-2 backdrop-blur-sm">
          <Clock className="mb-1 h-5 w-5 text-primary-foreground" />
          <span className="text-[10px] font-medium text-primary-foreground">
            od 25 min
          </span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-white/10 p-2 backdrop-blur-sm">
          <Truck className="mb-1 h-5 w-5 text-primary-foreground" />
          <span className="text-[10px] font-medium text-primary-foreground">
            Wnoszenie
          </span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-white/10 p-2 backdrop-blur-sm">
          <Shield className="mb-1 h-5 w-5 text-primary-foreground" />
          <span className="text-[10px] font-medium text-primary-foreground">
            Escrow
          </span>
        </div>
      </div>
    </section>
  );
}
