import * as React from 'react';
import { Input } from '@/components/ui/input';
import { formatRegon } from '@/lib/validators';
import { cn } from '@/lib/utils';

export interface RegonInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
}

const RegonInput = React.forwardRef<HTMLInputElement, RegonInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatRegon(e.target.value);
      onChange?.(formatted);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder="XXX XXX XXX"
        maxLength={17}
        className={cn(className)}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

RegonInput.displayName = 'RegonInput';

export { RegonInput };
