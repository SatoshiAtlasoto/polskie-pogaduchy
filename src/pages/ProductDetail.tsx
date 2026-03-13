import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Truck, Star, Minus, Plus, ShoppingCart, Store } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <span className="text-6xl">🔍</span>
        <h1 className="font-display text-xl font-bold">Nie znaleziono produktu</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          Wróć do sklepu
        </Button>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Dodano ${quantity}x do koszyka`, {
      description: product.name,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container flex items-center gap-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="line-clamp-1 font-display text-lg font-bold">{product.name}</h1>
        </div>
      </header>

      <main className="container space-y-6 py-4">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary/50">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {discount && (
            <Badge variant="destructive" className="absolute left-3 top-3 text-sm">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            <span>{product.storeName}</span>
            {product.rating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span>{product.rating}</span>
                </div>
              </>
            )}
          </div>

          <h2 className="font-display text-2xl font-bold">{product.name}</h2>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {product.price.toFixed(2)} zł
            </span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {product.originalPrice.toFixed(2)} zł
              </span>
            )}
            <span className="text-sm text-muted-foreground">/ {product.unit}</span>
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {/* Delivery Info */}
          <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{product.deliveryTime} min</p>
                <p className="text-xs text-muted-foreground">Czas dostawy</p>
              </div>
            </div>
            <div className="h-auto w-px bg-border" />
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{product.weight} kg</p>
                <p className="text-xs text-muted-foreground">Waga</p>
              </div>
            </div>
          </div>

          {/* Category */}
          <Badge variant="secondary" className="text-sm">
            {product.category}
          </Badge>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h3 className="mb-3 font-display text-lg font-semibold">Podobne produkty</h3>
            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/product/${rp.id}`}
                  className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50"
                >
                  <div className="aspect-square overflow-hidden bg-secondary/50">
                    <img src={rp.image} alt={rp.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-1 text-sm font-medium">{rp.name}</p>
                    <p className="text-sm font-bold text-primary">{rp.price.toFixed(2)} zł</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-lg safe-bottom">
        <div className="container flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 rounded-xl border border-border px-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-bold">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart */}
          <Button onClick={handleAddToCart} className="flex-1 gap-2 py-6 text-base font-semibold">
            <ShoppingCart className="h-5 w-5" />
            Dodaj {(product.price * quantity).toFixed(2)} zł
          </Button>
        </div>
      </div>
    </div>
  );
}
