import * as React from 'react';
import { Input } from '@/components/ui/input';
import { formatPhone } from '@/lib/validators';
import { cn } from '@/lib/utils';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      onChange?.(formatted);
    };

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        placeholder="+48 XXX XXX XXX"
        maxLength={15}
        className={cn(className)}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
