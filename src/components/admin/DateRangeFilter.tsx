import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangeFilterProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onClear: () => void;
}

export function DateRangeFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange, onClear }: DateRangeFilterProps) {
  const hasFilter = dateFrom || dateTo;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("w-[160px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
            <CalendarIcon className="h-4 w-4 mr-1" />
            {dateFrom ? format(dateFrom, 'dd.MM.yyyy') : 'Od daty'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateFrom}
            onSelect={onDateFromChange}
            disabled={(date) => date > new Date() || (dateTo ? date > dateTo : false)}
            locale={pl}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground text-sm">–</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("w-[160px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
            <CalendarIcon className="h-4 w-4 mr-1" />
            {dateTo ? format(dateTo, 'dd.MM.yyyy') : 'Do daty'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateTo}
            onSelect={onDateToChange}
            disabled={(date) => date > new Date() || (dateFrom ? date < dateFrom : false)}
            locale={pl}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 px-2">
          <X className="h-4 w-4 mr-1" />
          Wyczyść
        </Button>
      )}
    </div>
  );
}
