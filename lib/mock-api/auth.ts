import { supabaseBrowser } from '@/lib/supabase/client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  level?: string;
};

function mapSupabaseUser(user: any): AuthUser {
  return {
    id: user.id,
    name: user.user_metadata?.full_name || '',
    email: user.email || '',
    phone: user.user_metadata?.phone || '',
    level: user.user_metadata?.level || '',
  };
}

export const mockLogin = async (
  phoneOrEmail: string,
  password: string
): Promise<AuthUser> => {
  const email = phoneOrEmail.trim().toLowerCase();

  const { data, error } = await supabaseBrowser.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Utilisateur introuvable");
  }

  return mapSupabaseUser(data.user);
};

export const mockRegister = async (data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  level: string;
}): Promise<AuthUser> => {
  const email = (data.email || '').trim().toLowerCase();

  if (!email) {
    throw new Error("L'email est requis");
  }

  const { data: signUpData, error } = await supabaseBrowser.auth.signUp({
    email,
    password: data.password,
    options: {
      data: {
        full_name: data.name,
        phone: data.phone,
        level: data.level,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!signUpData.user) {
    throw new Error("Impossible de créer le compte");
  }

  return mapSupabaseUser(signUpData.user);
};

export const mockVerifyOTP = async (_phone: string, otp: string): Promise<boolean> => {
  return otp === '1234';
};

export const mockGetCurrentUser = async (): Promise<AuthUser | null> => {
  const { data, error } = await supabaseBrowser.auth.getUser();

  if (error) {
    return null;
  }

  if (!data.user) {
    return null;
  }

  return mapSupabaseUser(data.user);
};

export const mockLogout = async (): Promise<void> => {
  const { error } = await supabaseBrowser.auth.signOut();

  if (error) {
    throw error;
  }
};

export const setMockCurrentUser = (_user: AuthUser | null): void => {
  // plus besoin de stocker manuellement dans localStorage
};