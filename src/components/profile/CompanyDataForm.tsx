import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();
  const [fetching, setFetching] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: initialData?.company_name || '',
      company_nip: initialData?.company_nip || '',
      company_regon: initialData?.company_regon || '',
    },
  });

  const handleFetchFromGus = async () => {
    const rawNip = form.getValues('company_nip').replace(/[^\d]/g, '');

    if (rawNip.length !== 10) {
      toast({
        title: 'Błąd',
        description: 'Wpisz poprawny 10-cyfrowy NIP',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidNip(rawNip)) {
      toast({
        title: 'Błąd',
        description: 'Nieprawidłowy numer NIP (błędna suma kontrolna)',
        variant: 'destructive',
      });
      return;
    }

    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('gus-lookup', {
        body: { nip: rawNip },
      });

      if (error || !data?.success) {
        toast({
          title: 'Nie znaleziono',
          description: data?.error || 'Nie udało się pobrać danych firmy',
          variant: 'destructive',
        });
        return;
      }

      const companyData = data.data;
      if (companyData.company_name) {
        form.setValue('company_name', companyData.company_name, { shouldValidate: true });
      }
      if (companyData.company_regon) {
        form.setValue('company_regon', companyData.company_regon, { shouldValidate: true });
      }

      toast({
        title: 'Pobrano dane',
        description: `Znaleziono: ${companyData.company_name}`,
      });
    } catch (err) {
      console.error('GUS lookup error:', err);
      toast({
        title: 'Błąd',
        description: 'Nie udało się połączyć z rejestrem',
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

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
          name="company_nip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NIP</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <NipInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handleFetchFromGus}
                  disabled={fetching}
                  title="Pobierz dane z rejestru"
                >
                  {fetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormDescription>
                Wpisz NIP i kliknij 🔍 aby pobrać dane firmy automatycznie
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
