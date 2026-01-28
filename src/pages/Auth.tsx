import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Nieprawidłowy adres email' }),
  password: z
    .string()
    .min(6, { message: 'Hasło musi mieć minimum 6 znaków' }),
  fullName: z.string().optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (values: AuthFormValues) => {
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(values.email, values.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              variant: 'destructive',
              title: 'Błąd logowania',
              description: 'Nieprawidłowy email lub hasło',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Błąd logowania',
              description: error.message,
            });
          }
        } else {
          toast({
            title: 'Zalogowano pomyślnie',
            description: 'Witaj ponownie!',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(
          values.email,
          values.password,
          values.fullName
        );
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              variant: 'destructive',
              title: 'Błąd rejestracji',
              description: 'Ten email jest już zarejestrowany',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Błąd rejestracji',
              description: error.message,
            });
          }
        } else {
          toast({
            title: 'Konto utworzone',
            description: 'Możesz się teraz zalogować',
          });
          navigate('/');
        }
      }
    } catch (error) {
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
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg safe-top">
        <div className="container flex items-center gap-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-lg font-bold">
            {isLogin ? 'Logowanie' : 'Rejestracja'}
          </h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto max-w-md">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <span className="text-2xl font-bold text-primary-foreground">
                B
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">BudMat</h2>
            <p className="mt-2 text-center text-muted-foreground">
              {isLogin
                ? 'Zaloguj się, aby kontynuować'
                : 'Utwórz konto i zamawiaj materiały'}
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imię i nazwisko</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jan Kowalski"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete={
                            isLogin ? 'current-password' : 'new-password'
                          }
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Logowanie...' : 'Rejestracja...'}
                  </>
                ) : isLogin ? (
                  'Zaloguj się'
                ) : (
                  'Utwórz konto'
                )}
              </Button>
            </form>
          </Form>

          {/* Switch mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? 'Nie masz jeszcze konta?' : 'Masz już konto?'}
            </p>
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                form.reset();
              }}
              className="text-primary"
            >
              {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
            </Button>
          </div>

          {/* User levels info */}
          <div className="mt-8 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 font-display font-semibold">
              Poziomy użytkownika
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gość</span>
                <span>Karta/BLIK • Limit 500 zł</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zweryfikowany</span>
                <span>+ Gotówka • Limit 5000 zł</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PRO (Firma)</span>
                <span>Faktury • Bez limitu</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
