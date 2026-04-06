import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL est manquant');
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY est manquant');
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

export async function POST(request: Request) {
  try {
    const { supabaseUrl, supabaseServiceRoleKey } = getEnv();
    const body = await request.json();
    const email = String(body?.email ?? '').trim().toLowerCase();

    if (!email) {
      return jsonError('Email manquant', 400);
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('id, email, status, deleted_at')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 400, error);
    }

    // On ne révèle pas trop d’infos si le compte n’existe pas
    if (!profile) {
      return NextResponse.json({
        allowed: true,
      });
    }

    if (profile.deleted_at) {
      return NextResponse.json({
        allowed: false,
        reason: 'deleted',
        message: 'Ce compte n’existe plus.',
      });
    }

    if (profile.status === 'banned') {
      return NextResponse.json({
        allowed: false,
        reason: 'banned',
        message: 'Votre compte a été banni.',
      });
    }

    if (profile.status === 'suspended') {
      return NextResponse.json({
        allowed: false,
        reason: 'suspended',
        message: 'Votre compte est suspendu.',
      });
    }

    return NextResponse.json({
      allowed: true,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Erreur interne du serveur',
      500
    );
  }
}