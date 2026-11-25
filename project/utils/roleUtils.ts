import type { User } from '../types';

/**
 * Normaliza el rol del usuario a minúsculas de forma segura,
 * soportando tanto string como objetos `{ name: string }`.
 */
export const getNormalizedRole = (user?: User | null): string => {
    if (!user || !user.role) return '';
    return (typeof user.role === 'string'
        ? user.role
        : (user.role as any)?.name || ''
    ).toLowerCase().trim();
};

/** Verifica si el usuario tiene rol de Administrador. */
export const isAdminUser = (user?: User | null): boolean => {
    if (!user) return false;
    if (user.email?.toLowerCase() === 'ana@administrador.cl') return true;
    const role = getNormalizedRole(user);
    return role.includes('admin');
};

/** Verifica si el usuario tiene membresía Colaborador Premium. */
export const isPremiumUser = (user?: User | null): boolean => {
    const role = getNormalizedRole(user);
    return role.includes('premium');
};

/** Verifica si el usuario es Colaborador Gratis (o colaborador estándar sin Premium). */
export const isFreeCollaborator = (user?: User | null): boolean => {
    const role = getNormalizedRole(user);
    return role.includes('gratis') || role === 'colaborador';
};

/** Verifica si el usuario tiene rol de Cliente VIP (Sponsor). */
export const isClienteUser = (user?: User | null): boolean => {
    return getNormalizedRole(user) === 'cliente';
};

/** Verifica si el usuario tiene rol de Empresa. */
export const isEmpresaUser = (user?: User | null): boolean => {
    return getNormalizedRole(user).includes('empresa');
};

/**
 * Solo Colaborador Premium, Empresa y Administrador pueden publicar
 * avisos de Colaboraciones Urgentes. Colaborador Gratis y Cliente no tienen acceso.
 */
export const canPublishUrgentCollaboration = (user?: User | null): boolean => {
    if (!user) return false;
    return isAdminUser(user) || isPremiumUser(user) || isEmpresaUser(user);
};

/**
 * Solo periodistas/colaboradores (Gratis o Premium) y Administrador
 * pueden tener un perfil de postulante en el Banco de Talentos.
 */
export const canHaveTalentProfile = (user?: User | null): boolean => {
    if (!user) return false;
    return !isClienteUser(user) && !isEmpresaUser(user);
};
