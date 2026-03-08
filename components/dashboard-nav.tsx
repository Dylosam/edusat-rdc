'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { mockGetCurrentUser, mockLogout } from '@/lib/mock-api/auth';
import { User as UserType } from '@/lib/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    mockGetCurrentUser().then(setUser);
  }, []);

  const handleLogout = async () => {
    await mockLogout();
    toast.success('Déconnexion réussie');
    router.push('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { href: '/dashboard', label: 'Accueil' },
    { href: '/subjects', label: 'Matières' },
    { href: '/calendar', label: 'Calendrier' },
    { href: '/profile', label: 'Profil' },
  ];

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
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              <Link href="/dashboard" className="flex min-w-0 items-center space-x-2">
                <GraduationCap className="h-8 w-8 shrink-0 text-primary" />
                <span className="truncate text-lg font-bold font-serif sm:text-xl">
                  EduStat-RDC
                </span>
              </Link>

              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex shrink-0 items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Changer le thème"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      size="icon"
      className="hidden md:flex rounded-full"
    >
      <User className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.phone}</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/subscription" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Abonnement
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                      <Wrench className="mr-2 h-4 w-4" />
                      Outils
                    </DropdownMenuSubTrigger>

                    <DropdownMenuSubContent className="w-52">
                      <DropdownMenuItem asChild>
                        <Link href="/outils/horaire">Horaire de cours</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/outils/tableau-periodique">
                          Tableau périodique
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/outils/tableau-statistique">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              className="fixed left-0 top-0 z-[90] h-dvh w-[82%] max-w-[320px] border-r border-border/40 bg-background shadow-2xl md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.24 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
                <div className="flex min-w-0 items-center space-x-2">
                  <GraduationCap className="h-7 w-7 shrink-0 text-primary" />
                  <span className="truncate text-lg font-bold font-serif">
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
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'bg-muted text-primary'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-5 border-t border-border/40 pt-5">
                  <Link
                    href="/subscription"
                    onClick={closeMobileMenu}
                    className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      pathname === '/subscription'
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
                      href="/outils/horaire"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                    >
                      Horaire de cours
                    </Link>

                    <Link
                      href="/outils/tableau-periodique"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                    >
                      Tableau périodique
                    </Link>

                    <Link
                      href="/outils/tableau-statistique"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                    >
                      Tableau statistique
                    </Link>
                  </div>
                </div>

                <div className="mt-auto border-t border-border/40 pt-5">
                  <button
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