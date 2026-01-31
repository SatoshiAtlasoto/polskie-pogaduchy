import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Address, AddressInput } from '@/hooks/useAddresses';

const addressSchema = z.object({
  label: z.string().min(1, 'Podaj nazwę adresu').max(50),
  street: z.string().min(1, 'Podaj ulicę').max(100),
  building: z.string().min(1, 'Podaj numer budynku').max(20),
  apartment: z.string().max(20).optional().nullable(),
  floor: z.coerce.number().min(0).max(100),
  city: z.string().min(1, 'Podaj miasto').max(100),
  postal_code: z.string().regex(/^\d{2}-\d{3}$/, 'Format: XX-XXX'),
  notes: z.string().max(200).optional().nullable(),
  is_default: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: Address | null;
  onSubmit: (data: AddressInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function AddressForm({ address, onSubmit, onCancel, loading }: AddressFormProps) {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label || 'Dom',
      street: address?.street || '',
      building: address?.building || '',
      apartment: address?.apartment || '',
      floor: address?.floor || 0,
      city: address?.city || '',
      postal_code: address?.postal_code || '',
      notes: address?.notes || '',
      is_default: address?.is_default || false,
    },
  });

  const handleSubmit = async (data: AddressFormData) => {
    await onSubmit({
      label: data.label,
      street: data.street,
      building: data.building,
      apartment: data.apartment || null,
      floor: data.floor,
      city: data.city,
      postal_code: data.postal_code,
      notes: data.notes || null,
      is_default: data.is_default,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa adresu</FormLabel>
              <FormControl>
                <Input placeholder="np. Dom, Praca, Budowa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ulica</FormLabel>
              <FormControl>
                <Input placeholder="np. Główna" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="building"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numer budynku</FormLabel>
                <FormControl>
                  <Input placeholder="np. 15A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mieszkanie (opcjonalnie)</FormLabel>
                <FormControl>
                  <Input placeholder="np. 10" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="floor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Piętro</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kod pocztowy</FormLabel>
                <FormControl>
                  <Input placeholder="00-000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Miasto</FormLabel>
                <FormControl>
                  <Input placeholder="np. Warszawa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uwagi dla kuriera (opcjonalnie)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="np. Domofon nie działa, proszę dzwonić"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Ustaw jako domyślny adres</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={loading}>
            {address ? 'Zapisz zmiany' : 'Dodaj adres'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        </div>
      </form>
    </Form>
  );
}
