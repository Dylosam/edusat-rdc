import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
}

export async function POST(request: Request) {
  try {
    const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getEnv();

    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError('Token manquant', 401);
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError || !user) {
      return jsonError('Session invalide', 401);
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const now = new Date().toISOString();

    const { error } = await serviceClient
      .from('profiles')
      .update({
        last_seen_at: now,
        updated_at: now,
      })
      .eq('id', user.id)
      .is('deleted_at', null);

    if (error) {
      return jsonError(error.message, 400, error);
    }

    return NextResponse.json({
      success: true,
      last_seen_at: now,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Erreur interne du serveur',
      500
    );
  }
}