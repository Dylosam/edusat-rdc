import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type RouteContext = {
  params: {
    id: string;
  };
};

type Role = 'student' | 'admin' | 'super_admin';

type PatchPayload =
  | {
      action: 'updateRole';
      role: Role;
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

type AdminProfile = {
  id: string;
  role: 'admin' | 'super_admin';
  deleted_at: string | null;
  is_founder?: boolean | null;
};

type TargetProfile = {
  id: string;
  role: Role;
  deleted_at?: string | null;
  is_founder?: boolean | null;
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
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL est manquant');
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY est manquant');
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY est manquant');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
}

function isProtectedFounder(profile: { is_founder?: boolean | null }) {
  return Boolean(profile.is_founder);
}

function isSuperAdmin(profile: { role?: string | null }) {
  return profile.role === 'super_admin';
}

function canManageTarget(
  actor: AdminProfile,
  target: TargetProfile
): { allowed: boolean; reason?: string } {
  if (actor.id === target.id && isProtectedFounder(target)) {
    return {
      allowed: false,
      reason: 'Le compte fondateur ne peut pas être modifié par lui-même ici',
    };
  }

  if (isProtectedFounder(target)) {
    return {
      allowed: false,
      reason: 'Le compte fondateur est protégé',
    };
  }

  if (actor.role === 'admin' && isSuperAdmin(target)) {
    return {
      allowed: false,
      reason: 'Vous ne pouvez pas modifier un super admin',
    };
  }

  return { allowed: true };
}

function canAssignRole(
  actor: AdminProfile,
  target: TargetProfile,
  nextRole: Role
): { allowed: boolean; reason?: string } {
  const managementCheck = canManageTarget(actor, target);
  if (!managementCheck.allowed) return managementCheck;

  if (actor.role === 'admin' && nextRole === 'super_admin') {
    return {
      allowed: false,
      reason: 'Seul un super admin peut promouvoir quelqu’un en super admin',
    };
  }

  if (actor.role === 'admin' && target.role === 'super_admin') {
    return {
      allowed: false,
      reason: 'Un admin ne peut pas modifier le rôle d’un super admin',
    };
  }

  return { allowed: true };
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
      console.error('[AUTH ADMIN] getUser error:', userError);
      return { error: jsonError('Session invalide', 401), adminId: null };
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: adminProfile, error: profileError } = await serviceClient
      .from('profiles')
      .select('id, role, deleted_at, is_founder')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !adminProfile || adminProfile.deleted_at) {
      console.error('[AUTH ADMIN] profile error:', profileError, adminProfile);
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
    console.error('[AUTH ADMIN] unexpected error:', error);
    return {
      error: jsonError(
        error instanceof Error ? error.message : 'Erreur auth admin',
        500
      ),
      adminId: null,
    };
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthorizedAdmin(request);

    if (auth.error || !auth.serviceClient || !auth.adminProfile) {
      return auth.error!;
    }

    const { id } = params;

    if (!id) {
      return jsonError('ID utilisateur manquant', 400);
    }

    const body = (await request.json()) as PatchPayload;

    const { data: targetProfile, error: targetError } = await auth.serviceClient
      .from('profiles')
      .select('id, role, deleted_at, is_founder')
      .eq('id', id)
      .maybeSingle();

    if (targetError || !targetProfile || targetProfile.deleted_at) {
      return jsonError('Utilisateur introuvable', 404);
    }

    const target = targetProfile as TargetProfile;

    if (body.action === 'updateRole') {
      const permission = canAssignRole(auth.adminProfile, target, body.role);

      if (!permission.allowed) {
        return jsonError(permission.reason || 'Action non autorisée', 403);
      }

      if (auth.adminId === id && isProtectedFounder(target)) {
        return jsonError(
          'Le fondateur ne peut pas modifier son propre rôle ici',
          403
        );
      }

      const { error } = await auth.serviceClient
        .from('profiles')
        .update({
          role: body.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        return jsonError(error.message, 400, error);
      }

      return NextResponse.json({ success: true });
    }

    const moderationPermission = canManageTarget(auth.adminProfile, target);

    if (!moderationPermission.allowed) {
      return jsonError(moderationPermission.reason || 'Action non autorisée', 403);
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
        return jsonError(error.message, 400, error);
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
        return jsonError(error.message, 400, error);
      }

      return NextResponse.json({ success: true });
    }

    if (body.action === 'banTemporary') {
      if (!Number.isFinite(body.days) || body.days <= 0) {
        return jsonError('Le nombre de jours est invalide', 400);
      }

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
        return jsonError(error.message, 400, error);
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
        return jsonError(error.message, 400, error);
      }

      return NextResponse.json({ success: true });
    }

    return jsonError('Action inconnue', 400);
  } catch (error) {
    console.error('[PATCH USER] unexpected error:', error);
    return jsonError(
      error instanceof Error ? error.message : 'Erreur interne du serveur',
      500
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    console.log('[DELETE USER] called with params:', params);

    const auth = await getAuthorizedAdmin(request);

    if (auth.error || !auth.serviceClient || !auth.adminProfile) {
      return auth.error!;
    }

    const { id } = params;

    if (!id) {
      return jsonError('ID utilisateur manquant', 400);
    }

    if (auth.adminId === id) {
      return jsonError('Vous ne pouvez pas supprimer votre propre compte ici', 403);
    }

    const { data: targetProfile, error: targetError } = await auth.serviceClient
      .from('profiles')
      .select('id, role, is_founder')
      .eq('id', id)
      .maybeSingle();

    console.log('[DELETE USER] targetProfile:', targetProfile);

    if (targetError) {
      console.error('[DELETE USER] target profile error:', targetError);
      return jsonError(targetError.message, 400, targetError);
    }

    if (!targetProfile) {
      return jsonError('Utilisateur introuvable', 404);
    }

    const target = targetProfile as TargetProfile;
    const permission = canManageTarget(auth.adminProfile, target);

    if (!permission.allowed) {
      return jsonError(permission.reason || 'Action non autorisée', 403);
    }

    const { error: deleteAuthError } =
      await auth.serviceClient.auth.admin.deleteUser(id);

    if (deleteAuthError) {
      console.warn('[DELETE USER] auth delete warning:', deleteAuthError);
    }

    const { error: deleteProfileError } = await auth.serviceClient
      .from('profiles')
      .delete()
      .eq('id', id);

    if (deleteProfileError) {
      console.error('[DELETE USER] profile delete error:', deleteProfileError);
      return jsonError(deleteProfileError.message, 400, deleteProfileError);
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    console.error('[DELETE USER] unexpected error:', error);
    return jsonError(
      error instanceof Error ? error.message : 'Erreur interne du serveur',
      500
    );
  }
}