import { Clock, Plus, Star, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Dodano do koszyka', {
      description: product.name,
    });
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        'group relative block overflow-hidden rounded-xl bg-gradient-card border border-border transition-all hover:border-primary/50',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {discount && (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
            -{discount}%
          </span>
        )}
        <Button
          size="icon"
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary shadow-lg transition-transform hover:scale-110"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Store & Rating */}
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{product.storeName}</span>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span>{product.rating}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {product.price.toFixed(2)} zł
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {product.originalPrice.toFixed(2)} zł
            </span>
          )}
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{product.deliveryTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-3 w-3" />
            <span>{product.weight} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
