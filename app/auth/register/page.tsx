'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { supabaseBrowser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}

function isProfilesRlsError(message: string): boolean {
  const text = message.toLowerCase();
  return (
    text.includes('row-level security') ||
    text.includes('violates row-level security policy') ||
    text.includes('profiles')
  );
}

function isAlreadyRegisteredMessage(message: string): boolean {
  const text = message.toLowerCase();
  return (
    text.includes('already registered') ||
    text.includes('already been registered') ||
    text.includes('user already registered') ||
    text.includes('already exists') ||
    text.includes('email rate limit exceeded') // garde-fou éventuel
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const passwordStrengthLabel = useMemo(() => {
    const pwd = formData.password;

    if (!pwd) return '';
    if (pwd.length < 6) return 'Faible';
    if (pwd.length < 10) return 'Moyen';
    return 'Bon';
  }, [formData.password]);

  const updateField =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!fullName) {
      toast.error('Veuillez renseigner votre nom complet');
      return;
    }

    if (!email) {
      toast.error('Veuillez renseigner votre email');
      return;
    }

    if (!password) {
      toast.error('Veuillez renseigner votre mot de passe');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        const message = getErrorMessage(error, 'Inscription impossible');

        if (isAlreadyRegisteredMessage(message)) {
          toast.info('Un compte existe déjà avec cet email. Connecte-toi pour continuer.');
          router.push('/auth/login');
          return;
        }

        throw error;
      }

      if (!data.user) {
        throw new Error('Inscription impossible');
      }

      const { error: profileError } = await supabaseBrowser
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            full_name: fullName,
            email,
            role: 'student',
            status: 'active',
            deleted_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (profileError) {
        const profileMessage = getErrorMessage(
          profileError,
          'Profil non créé'
        );

        if (isProfilesRlsError(profileMessage)) {
          toast.success(
            'Compte créé. Connecte-toi maintenant pour accéder à la plateforme.'
          );
          router.push('/auth/login');
          return;
        }

        throw profileError;
      }

      toast.success('Compte créé avec succès');
      router.push('/auth/login');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Inscription impossible');

      if (isAlreadyRegisteredMessage(message)) {
        toast.info('Ce compte existe déjà. Connecte-toi pour continuer.');
        router.push('/auth/login');
        return;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="font-serif text-2xl font-bold">EduStat-RDC</span>
          </Link>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl font-bold">
                Créer un compte
              </CardTitle>
              <CardDescription className="text-center">
                Rejoignez EduStat-RDC
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={formData.fullName}
                    onChange={updateField('fullName')}
                    required
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean@example.com"
                    value={formData.email}
                    onChange={updateField('email')}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    {passwordStrengthLabel ? (
                      <span className="text-xs text-muted-foreground">
                        Niveau : {passwordStrengthLabel}
                      </span>
                    ) : null}
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={updateField('password')}
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isLoading}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
                      aria-label={
                        showPassword
                          ? 'Masquer le mot de passe'
                          : 'Afficher le mot de passe'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={updateField('confirmPassword')}
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      disabled={isLoading}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
                      aria-label={
                        showConfirmPassword
                          ? 'Masquer la confirmation du mot de passe'
                          : 'Afficher la confirmation du mot de passe'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  Vous avez déjà un compte ?{' '}
                </span>
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Se connecter
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}