import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { HeroBanner } from '@/components/home/HeroBanner';
import { SortToggle } from '@/components/home/SortToggle';
import { CategoryScroller } from '@/components/home/CategoryScroller';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/data/products';
import { SortMode } from '@/types';

const Index = () => {
  const [sortMode, setSortMode] = useState<SortMode>('fastest');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryMap: Record<string, string> = {
        cement: 'Cement i beton',
        cegly: 'Cegły i bloczki',
        izolacje: 'Izolacje',
        plyty: 'Płyty i panele',
        farby: 'Farby i tynki',
        narzedzia: 'Narzędzia',
      };
      result = result.filter(
        (p) => p.category === categoryMap[selectedCategory]
      );
    }

    // Sort
    if (sortMode === 'fastest') {
      result.sort((a, b) => a.deliveryTime - b.deliveryTime);
    } else {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  }, [sortMode, selectedCategory]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container space-y-6 py-4">
        {/* Hero */}
        <HeroBanner />

        {/* Sort Toggle */}
        <SortToggle value={sortMode} onChange={setSortMode} />

        {/* Categories */}
        <CategoryScroller
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Products Grid */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {selectedCategory === 'all'
                ? 'Popularne produkty'
                : filteredProducts.length > 0
                ? `${filteredProducts[0].category}`
                : 'Produkty'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} produktów
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="mb-2 text-4xl">🔍</span>
              <p className="text-muted-foreground">
                Brak produktów w tej kategorii
              </p>
            </div>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
};

export default Index;
