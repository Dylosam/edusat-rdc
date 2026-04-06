import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type AdminProfile = {
  id: string;
  role: 'admin' | 'super_admin';
  deleted_at: string | null;
  is_founder?: boolean | null;
};

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'student' | 'admin' | 'super_admin';
  status: 'active' | 'banned' | 'suspended';
  banned_until: string | null;
  ban_reason: string | null;
  deleted_at: string | null;
  last_seen_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_founder: boolean | null;
};

type LessonProgressRow = {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percent: number;
  completed: boolean;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type UserWithStats = UserProfile & {
  lessons_started: number;
  lessons_completed: number;
  average_progress: number;
  is_online: boolean;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

function getEnv() {
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL est manquant');
  if (!supabaseAnonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY est manquant');
  if (!supabaseServiceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY est manquant');

  return { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey };
}

function isUserOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;

  const lastSeen = new Date(lastSeenAt).getTime();
  const now = Date.now();
  const diffMs = now - lastSeen;

  return diffMs >= 0 && diffMs <= 5 * 60 * 1000;
}

function computeUserStats(
  profile: UserProfile,
  progressRows: LessonProgressRow[]
): UserWithStats {
  const lessonsStarted = progressRows.length;
  const lessonsCompleted = progressRows.filter((item) => item.completed).length;

  const averageProgress =
    progressRows.length > 0
      ? Math.round(
          progressRows.reduce((sum, item) => sum + item.progress_percent, 0) /
            progressRows.length
        )
      : 0;

  return {
    ...profile,
    lessons_started: lessonsStarted,
    lessons_completed: lessonsCompleted,
    average_progress: averageProgress,
    is_online: isUserOnline(profile.last_seen_at),
  };
}

async function getAuthorizedAdmin(request: Request) {
  try {
    const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getEnv();

    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return { error: jsonError('Token manquant', 401), adminId: null };
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError || !user) {
      console.error('[AUTH ADMIN LIST] getUser error:', userError);
      return { error: jsonError('Session invalide', 401), adminId: null };
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: adminProfile, error: profileError } = await serviceClient
      .from('profiles')
      .select('id, role, deleted_at, is_founder')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !adminProfile || adminProfile.deleted_at) {
      console.error('[AUTH ADMIN LIST] profile error:', profileError, adminProfile);
      return { error: jsonError('Profil admin introuvable', 403), adminId: null };
    }

    if (!['admin', 'super_admin'].includes(adminProfile.role)) {
      return { error: jsonError('Accès refusé', 403), adminId: null };
    }

    return {
      error: null,
      adminId: user.id,
      adminRole: adminProfile.role as 'admin' | 'super_admin',
      adminProfile: adminProfile as AdminProfile,
      serviceClient,
    };
  } catch (error) {
    console.error('[AUTH ADMIN LIST] unexpected error:', error);
    return {
      error: jsonError(
        error instanceof Error ? error.message : 'Erreur auth admin',
        500
      ),
      adminId: null,
    };
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthorizedAdmin(request);

    if (auth.error || !auth.serviceClient) {
      return auth.error!;
    }

    const { data: profiles, error: profilesError } = await auth.serviceClient
      .from('profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (profilesError) {
      return jsonError(profilesError.message, 400, profilesError);
    }

    const { data: progress, error: progressError } = await auth.serviceClient
      .from('lesson_progress')
      .select('*');

    if (progressError) {
      return jsonError(progressError.message, 400, progressError);
    }

    const progressByUser = new Map<string, LessonProgressRow[]>();

    for (const row of (progress ?? []) as LessonProgressRow[]) {
      const current = progressByUser.get(row.user_id) ?? [];
      current.push(row);
      progressByUser.set(row.user_id, current);
    }

    const users = ((profiles ?? []) as UserProfile[]).map((profile) =>
      computeUserStats(profile, progressByUser.get(profile.id) ?? [])
    );

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[GET ADMIN USERS] unexpected error:', error);
    return jsonError(
      error instanceof Error ? error.message : 'Erreur interne du serveur',
      500
    );
  }
}