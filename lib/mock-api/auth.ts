import { User } from '../types';

const mockUser: User = {
  id: '1',
  name: 'Jean Mukendi',
  email: 'jean.mukendi@example.com',
  phone: '+243 812 345 678',
  level: '3eHumSc',
  subscription: 'free',
  joinDate: '2024-01-15',
  totalTimeStudied: 12540,
};

// ✅ Cookie key utilisé par middleware
const COOKIE_KEY = 'edusat_user';

// ✅ helper cookie (client only)
function setCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export const mockLogin = async (phoneOrEmail: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (password === 'wrong') {
    throw new Error('Identifiants incorrects');
  }

  return mockUser;
};

export const mockRegister = async (data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  level: string;
}): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1200));

  return {
    ...mockUser,
    ...data,
    id: Math.random().toString(36),
    subscription: 'free',
    joinDate: new Date().toISOString().split('T')[0],
    totalTimeStudied: 0,
  };
};

export const mockVerifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return otp === '1234';
};

export const mockGetCurrentUser = async (): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      return JSON.parse(stored);
    }
  }

  return null;
};

export const mockLogout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
    removeCookie(COOKIE_KEY);
  }
};

export const setMockCurrentUser = (user: User | null): void => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));

      // ✅ cookie minimal (pas tout l'user, juste un marqueur)
      // (évite de stocker des infos perso en clair dans un cookie)
      setCookie(COOKIE_KEY, user.id);
    } else {
      localStorage.removeItem('currentUser');
      removeCookie(COOKIE_KEY);
    }
  }
};

// ✅ utile si tu veux checker rapidement côté client
export const hasAuthCookie = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith(`${COOKIE_KEY}=`));
};
