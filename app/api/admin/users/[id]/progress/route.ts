import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type RouteContext = {
  params: {
    id: string;
  };
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

async function getAuthorizedAdmin(request: Request) {
  try {
    const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getEnv();

    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return { error: jsonError('Token manquant', 401) };
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError || !user) {
      return { error: jsonError('Session invalide', 401) };
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: adminProfile, error: profileError } = await serviceClient
      .from('profiles')
      .select('id, role, deleted_at')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !adminProfile || adminProfile.deleted_at) {
      return { error: jsonError('Profil admin introuvable', 403) };
    }

    if (!['admin', 'super_admin'].includes(adminProfile.role)) {
      return { error: jsonError('Accès refusé', 403) };
    }

    return {
      error: null,
      serviceClient,
    };
  } catch (error) {
    return {
      error: jsonError(
        error instanceof Error ? error.message : 'Erreur auth admin',
        500
      ),
    };
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthorizedAdmin(request);

    if (auth.error || !auth.serviceClient) {
      return auth.error!;
    }

    const { id } = params;

    if (!id) {
      return jsonError('ID utilisateur manquant', 400);
    }

    const { data, error } = await auth.serviceClient
      .from('lesson_progress')
      .select('*')
      .eq('user_id', id)
      .order('updated_at', { ascending: false });

    if (error) {
      return jsonError(error.message, 400, error);
    }

    return NextResponse.json({
      progress: data ?? [],
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Erreur interne du serveur',
      500
    );
  }
}