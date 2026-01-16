import { useState, useMemo } from 'react';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductCard } from '@/components/products/ProductCard';
import { SortToggle } from '@/components/home/SortToggle';
import { products } from '@/data/products';
import { SortMode } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Search() {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('fastest');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      result = result.filter((product) => {
        const searchText = `${product.name} ${product.category} ${product.storeName}`.toLowerCase();
        return searchTerms.every((term) => searchText.includes(term));
      });
    }

    // Sort
    if (sortMode === 'fastest') {
      result.sort((a, b) => a.deliveryTime - b.deliveryTime);
    } else {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  }, [query, sortMode]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container space-y-4 py-4">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Szukaj materiałów..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 rounded-xl bg-secondary pl-12 pr-12 text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex gap-2">
          <div className="flex-1">
            <SortToggle value={sortMode} onChange={setSortMode} />
          </div>
          <Button variant="secondary" size="icon" className="h-12 w-12 shrink-0">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Results */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {query ? 'Wyniki wyszukiwania' : 'Wszystkie produkty'}
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
              <p className="mb-1 font-medium">Brak wyników</p>
              <p className="text-sm text-muted-foreground">
                Spróbuj innych słów kluczowych
              </p>
            </div>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
