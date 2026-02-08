import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NipInput } from '@/components/ui/nip-input';
import { RegonInput } from '@/components/ui/regon-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { isValidNip, isValidRegon } from '@/lib/validators';

const companySchema = z.object({
  company_name: z
    .string()
    .min(2, 'Nazwa firmy musi mieć min. 2 znaki')
    .max(200, 'Nazwa firmy może mieć max. 200 znaków')
    .trim(),
  company_nip: z
    .string()
    .transform((val) => val.replace(/[^\d]/g, ''))
    .refine((val) => val.length === 10, {
      message: 'NIP musi mieć 10 cyfr',
    })
    .refine((val) => isValidNip(val), {
      message: 'Nieprawidłowy numer NIP (błędna suma kontrolna)',
    }),
  company_regon: z
    .string()
    .optional()
    .transform((val) => val ? val.replace(/[^\d]/g, '') : '')
    .refine((val) => val === '' || val.length === 9 || val.length === 14, {
      message: 'REGON musi mieć 9 lub 14 cyfr',
    })
    .refine((val) => val === '' || isValidRegon(val), {
      message: 'Nieprawidłowy numer REGON (błędna suma kontrolna)',
    }),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyDataFormProps {
  initialData?: {
    company_name: string | null;
    company_nip: string | null;
    company_regon: string | null;
  };
  onSubmit: (data: { company_name: string; company_nip: string; company_regon: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CompanyDataForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: CompanyDataFormProps) {
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: initialData?.company_name || '',
      company_nip: initialData?.company_nip || '',
      company_regon: initialData?.company_regon || '',
    },
  });

  const handleSubmit = async (data: CompanyFormData) => {
    await onSubmit({
      company_name: data.company_name,
      company_nip: data.company_nip,
      company_regon: data.company_regon || '',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa firmy</FormLabel>
              <FormControl>
                <Input placeholder="np. Budex Sp. z o.o." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_nip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NIP</FormLabel>
              <FormControl>
                <NipInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormDescription>
                Format: XXX-XXX-XX-XX (automatyczne formatowanie)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_regon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>REGON (opcjonalnie)</FormLabel>
              <FormControl>
                <RegonInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormDescription>
                Format: XXX XXX XXX (9 cyfr) lub XX XXX XXXXX XXXXX (14 cyfr)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Zapisywanie...' : 'Zapisz dane firmy'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        </div>
      </form>
    </Form>
  );
}
