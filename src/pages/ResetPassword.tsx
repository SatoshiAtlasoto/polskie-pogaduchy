import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Eye, EyeOff, Mail, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const requestSchema = z.object({
  email: z.string().trim().email({ message: 'Nieprawidłowy adres email' }),
});

const resetSchema = z.object({
  password: z.string().min(6, { message: 'Hasło musi mieć minimum 6 znaków' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła muszą być takie same',
  path: ['confirmPassword'],
});

type RequestFormValues = z.infer<typeof requestSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if we're in "set new password" mode (user clicked the reset link)
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    // Supabase sends the user back with a hash containing access_token
    // The auth state change will fire a PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetMode(true);
      }
    });

    // Also check hash fragment for recovery flow
    if (window.location.hash.includes('type=recovery')) {
      setIsResetMode(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onRequestSubmit = async (values: RequestFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: error.message,
        });
      } else {
        setEmailSent(true);
        toast({
          title: 'Email wysłany',
          description: 'Sprawdź swoją skrzynkę pocztową',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Wystąpił błąd',
        description: 'Spróbuj ponownie później',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (values: ResetFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: error.message,
        });
      } else {
        toast({
          title: 'Hasło zmienione',
          description: 'Możesz się teraz zalogować nowym hasłem',
        });
        navigate('/auth');
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Wystąpił błąd',
        description: 'Spróbuj ponownie później',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg safe-top">
        <div className="container flex items-center gap-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/auth')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-lg font-bold">
            {isResetMode ? 'Nowe hasło' : 'Resetowanie hasła'}
          </h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto max-w-md">
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              {isResetMode ? (
                <KeyRound className="h-8 w-8 text-primary-foreground" />
              ) : (
                <Mail className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">
              {isResetMode ? 'Ustaw nowe hasło' : 'Zapomniałeś hasła?'}
            </h2>
            <p className="mt-2 text-center text-muted-foreground">
              {isResetMode
                ? 'Wpisz nowe hasło dla swojego konta'
                : 'Podaj swój email, a wyślemy Ci link do resetowania hasła'}
            </p>
          </div>

          {isResetMode ? (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nowe hasło</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potwierdź hasło</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    'Zapisz nowe hasło'
                  )}
                </Button>
              </form>
            </Form>
          ) : emailSent ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 font-display text-lg font-semibold">Sprawdź email</h3>
              <p className="text-sm text-muted-foreground">
                Jeśli konto z tym adresem istnieje, wysłaliśmy link do resetowania hasła.
                Sprawdź również folder spam.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setEmailSent(false)}
              >
                Wyślij ponownie
              </Button>
            </div>
          ) : (
            <Form {...requestForm}>
              <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                <FormField
                  control={requestForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jan@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wysyłanie...
                    </>
                  ) : (
                    'Wyślij link resetujący'
                  )}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => navigate('/auth')} className="text-primary">
              Wróć do logowania
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
