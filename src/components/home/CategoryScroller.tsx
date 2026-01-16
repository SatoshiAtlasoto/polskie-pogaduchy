import { categories } from '@/data/products';
import { cn } from '@/lib/utils';

interface CategoryScrollerProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryScroller({ selected, onSelect }: CategoryScrollerProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide">
      <div className="flex gap-2 pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={cn(
              'flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
              selected === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            )}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
