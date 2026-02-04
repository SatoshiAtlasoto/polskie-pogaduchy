import * as React from 'react';
import { Input } from '@/components/ui/input';
import { formatNip } from '@/lib/validators';
import { cn } from '@/lib/utils';

export interface NipInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
}

const NipInput = React.forwardRef<HTMLInputElement, NipInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatNip(e.target.value);
      onChange?.(formatted);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder="XXX-XXX-XX-XX"
        maxLength={13}
        className={cn(className)}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

NipInput.displayName = 'NipInput';

export { NipInput };
