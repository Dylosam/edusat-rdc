import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type RouteContext = {
  params: {
    id: string;
  };
};

type PatchPayload =
  | {
      action: 'updateRole';
      role: 'student' | 'admin' | 'super_admin';
    }
  | {
      action: 'activate';
    }
  | {
      action: 'suspend';
      reason?: string;
    }
  | {
      action: 'banTemporary';
      days: number;
      reason?: string;
    }
  | {
      action: 'banPermanent';
      reason?: string;
    };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL est manquant');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY est manquant');
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY est manquant');
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getAuthorizedAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return { error: jsonError('Token manquant', 401), adminId: null };
  }

  const token = authHeader.replace('Bearer ', '').trim();

  const authClient = createClient(supabaseUrl!, supabaseAnonKey!);
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return { error: jsonError('Session invalide', 401), adminId: null };
  }

  const serviceClient = createClient(supabaseUrl!, supabaseServiceRoleKey!);

  const { data: adminProfile, error: profileError } = await serviceClient
    .from('profiles')
    .select('id, role, deleted_at')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !adminProfile || adminProfile.deleted_at) {
    return { error: jsonError('Profil admin introuvable', 403), adminId: null };
  }

  if (!['admin', 'super_admin'].includes(adminProfile.role)) {
    return { error: jsonError('Accès refusé', 403), adminId: null };
  }

  return {
    error: null,
    adminId: user.id,
    adminRole: adminProfile.role as 'admin' | 'super_admin',
    serviceClient,
  };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await getAuthorizedAdmin(request);

  if (auth.error || !auth.serviceClient) {
    return auth.error!;
  }

  const { id } = params;

  if (!id) {
    return jsonError('ID utilisateur manquant', 400);
  }

  const body = (await request.json()) as PatchPayload;

  const { data: targetProfile, error: targetError } = await auth.serviceClient
    .from('profiles')
    .select('id, role, deleted_at')
    .eq('id', id)
    .maybeSingle();

  if (targetError || !targetProfile || targetProfile.deleted_at) {
    return jsonError('Utilisateur introuvable', 404);
  }

  const isTargetSuperAdmin = targetProfile.role === 'super_admin';

  if (isTargetSuperAdmin && auth.adminRole !== 'super_admin') {
    return jsonError("Vous ne pouvez pas modifier un super admin", 403);
  }

  if (body.action === 'updateRole') {
    const { error } = await auth.serviceClient
      .from('profiles')
      .update({
        role: body.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ success: true });
  }

  if (body.action === 'activate') {
    const { error } = await auth.serviceClient
      .from('profiles')
      .update({
        status: 'active',
        banned_until: null,
        ban_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ success: true });
  }

  if (body.action === 'suspend') {
    const { error } = await auth.serviceClient
      .from('profiles')
      .update({
        status: 'suspended',
        banned_until: null,
        ban_reason: body.reason ?? 'Compte suspendu',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ success: true });
  }

  if (body.action === 'banTemporary') {
    const bannedUntil = new Date(
      Date.now() + body.days * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error } = await auth.serviceClient
      .from('profiles')
      .update({
        status: 'banned',
        banned_until: bannedUntil,
        ban_reason:
          body.reason ??
          `Bannissement temporaire ${body.days} jour${body.days > 1 ? 's' : ''}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ success: true, banned_until: bannedUntil });
  }

  if (body.action === 'banPermanent') {
    const { error } = await auth.serviceClient
      .from('profiles')
      .update({
        status: 'banned',
        banned_until: null,
        ban_reason: body.reason ?? 'Bannissement définitif',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ success: true });
  }

  return jsonError('Action inconnue', 400);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const auth = await getAuthorizedAdmin(request);

  if (auth.error || !auth.serviceClient) {
    return auth.error!;
  }

  const { id } = params;

  if (!id) {
    return jsonError('ID utilisateur manquant', 400);
  }

  if (auth.adminId === id) {
    return jsonError("Vous ne pouvez pas supprimer votre propre compte ici", 403);
  }

  const { data: targetProfile, error: targetError } = await auth.serviceClient
    .from('profiles')
    .select('id, role')
    .eq('id', id)
    .maybeSingle();

  if (targetError || !targetProfile) {
    return jsonError('Utilisateur introuvable', 404);
  }

  if (targetProfile.role === 'super_admin') {
    return jsonError('Le super admin ne peut pas être supprimé', 403);
  }

  const { error: deleteProfileError } = await auth.serviceClient
    .from('profiles')
    .delete()
    .eq('id', id);

  if (deleteProfileError) {
    return jsonError(deleteProfileError.message, 400);
  }

  const { error: deleteAuthError } = await auth.serviceClient.auth.admin.deleteUser(id);

  if (deleteAuthError) {
    return jsonError(deleteAuthError.message, 400);
  }

  return NextResponse.json({ success: true });
}