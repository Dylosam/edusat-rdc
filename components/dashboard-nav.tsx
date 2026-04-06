'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  GraduationCap,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  Wrench,
  Menu,
  X,
  Brain,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { mockGetCurrentUser, mockLogout } from '@/lib/mock-api/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const USER_CACHE_KEY = 'edustat:nav:user';

type NavItem = {
  href: string;
  label: string;
};

type NavbarUser = {
  name?: string;
  fullName?: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
};

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const [user, setUser] = useState<NavbarUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);

  const navItems = useMemo<NavItem[]>(
    () => [
      { href: '/dashboard', label: 'Accueil' },
      { href: '/subjects', label: 'Matières' },
      { href: '/ai', label: 'BΞRN AI' },
      { href: '/calendar', label: 'Calendrier' },
      { href: '/profile', label: 'Profil' },
    ],
    []
  );

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const cached =
          typeof window !== 'undefined' ? sessionStorage.getItem(USER_CACHE_KEY) : null;

        if (cached) {
          try {
            const parsed = JSON.parse(cached) as NavbarUser;
            if (mounted) setUser(parsed);
          } catch {
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem(USER_CACHE_KEY);
            }
          }
        }

        const currentUser = (await mockGetCurrentUser()) as NavbarUser | null;
        if (!mounted) return;

        setUser(currentUser ?? null);

        if (typeof window !== 'undefined') {
          if (currentUser) {
            sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(currentUser));
          } else {
            sessionStorage.removeItem(USER_CACHE_KEY);
          }
        }
      } catch {
        if (!mounted) return;
        setUser(null);

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(USER_CACHE_KEY);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (pathname === href) return true;

      if (href === '/dashboard') {
        return pathname === '/dashboard';
      }

      return pathname.startsWith(`${href}/`);
    },
    [pathname]
  );

  const handleLogout = useCallback(async () => {
    try {
      await mockLogout();
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(USER_CACHE_KEY);
      }

      setUser(null);
      setMobileMenuOpen(false);
      toast.success('Déconnexion réussie');
      router.push('/');
      router.refresh();
    }
  }, [router]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const currentTheme = theme === 'system' ? resolvedTheme : theme;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme, theme]);

  const userDisplayName =
    user?.name ||
    user?.fullName ||
    user?.full_name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'Utilisateur';

  const userPhone = user?.phone || user?.email || 'Non renseigné';

  const renderNoTranslateLabel = (label: string) => (
    <span translate="no" className="notranslate">
      {label}
    </span>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center space-x-3 sm:space-x-8">
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={openMobileMenu}
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              <Link prefetch href="/dashboard" className="flex min-w-0 items-center space-x-2">
                <GraduationCap className="h-8 w-8 shrink-0 text-primary" />
                <span
                  translate="no"
                  className="notranslate truncate font-serif text-lg font-bold sm:text-xl"
                >
                  EduStat-RDC
                </span>
              </Link>

              <nav className="hidden items-center space-x-6 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    prefetch
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {renderNoTranslateLabel(item.label)}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex shrink-0 items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Changer le thème"
                className="relative"
              >
                {themeMounted ? (
                  <>
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </>
                ) : (
                  <Sun className="h-5 w-5 opacity-0" />
                )}
                <span className="sr-only">Changer le thème</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden rounded-full md:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userDisplayName}</p>
                      <p className="text-xs text-muted-foreground">{userPhone}</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link prefetch href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link prefetch href="/subscription" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Abonnement
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link prefetch href="/ai" className="cursor-pointer">
                      <Brain className="mr-2 h-4 w-4" />
                      <span translate="no" className="notranslate">
                        BΞRN AI
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                      <Wrench className="mr-2 h-4 w-4" />
                      Outils
                    </DropdownMenuSubTrigger>

                    <DropdownMenuSubContent className="w-52">
                      <DropdownMenuItem asChild>
                        <Link prefetch href="/outils/horaire">
                          Horaire de cours
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link prefetch href="/outils/tableau-periodique">
                          Tableau périodique
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link prefetch href="/outils/tableau-statistique">
                          Tableau statistique
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Fermer le menu"
              onClick={closeMobileMenu}
              className="fixed inset-0 z-[80] bg-black/45 md:hidden"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            />

            <motion.aside
              className="fixed left-0 top-0 z-[90] h-dvh w-[82%] max-w-[320px] border-r border-border/40 bg-background shadow-2xl md:hidden"
              initial={prefersReducedMotion ? false : { x: '-100%' }}
              animate={{ x: 0 }}
              exit={prefersReducedMotion ? undefined : { x: '-100%' }}
              transition={{ type: 'tween', duration: 0.18 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
                <div className="flex min-w-0 items-center space-x-2">
                  <GraduationCap className="h-7 w-7 shrink-0 text-primary" />
                  <span
                    translate="no"
                    className="notranslate truncate font-serif text-lg font-bold"
                  >
                    EduStat-RDC
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={closeMobileMenu}
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto px-3 py-4">
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      prefetch
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-muted text-primary'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-primary'
                      }`}
                    >
                      {renderNoTranslateLabel(item.label)}
                    </Link>
                  ))}
                </nav>

                <div className="mt-5 border-t border-border/40 pt-5">
                  <Link
                    prefetch
                    href="/subscription"
                    onClick={closeMobileMenu}
                    className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isActive('/subscription')
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-primary'
                    }`}
                  >
                    Abonnement
                  </Link>
                </div>

                <div className="mt-5 border-t border-border/40 pt-5">
                  <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Outils
                  </p>

                  <div className="flex flex-col gap-1">
                    <Link
                      prefetch
                      href="/outils/horaire"
                      onClick={closeMobileMenu}
                      className={`rounded-lg px-3 py-3 text-sm transition-colors ${
                        isActive('/outils/horaire')
                          ? 'bg-muted text-primary'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-primary'
                      }`}
                    >
                      Horaire de cours
                    </Link>

                    <Link
                      prefetch
                      href="/outils/tableau-periodique"
                      onClick={closeMobileMenu}
                      className={`rounded-lg px-3 py-3 text-sm transition-colors ${
                        isActive('/outils/tableau-periodique')
                          ? 'bg-muted text-primary'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-primary'
                      }`}
                    >
                      Tableau périodique
                    </Link>

                    <Link
                      prefetch
                      href="/outils/tableau-statistique"
                      onClick={closeMobileMenu}
                      className={`rounded-lg px-3 py-3 text-sm transition-colors ${
                        isActive('/outils/tableau-statistique')
                          ? 'bg-muted text-primary'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-primary'
                      }`}
                    >
                      Tableau statistique
                    </Link>
                  </div>
                </div>

                <div className="mt-auto border-t border-border/40 pt-5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}