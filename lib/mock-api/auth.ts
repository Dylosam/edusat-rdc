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
  await new Promise(resolve => setTimeout(resolve, 500));

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      return JSON.parse(stored);
    }
  }

  return null;
};

export const mockLogout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
  }
};

export const setMockCurrentUser = (user: User | null): void => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }
};
