export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export enum Permission {
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_SUSPEND = 'user:suspend',
  USER_MANAGE_ALL = 'user:manage_all',
  PRODUCT_READ = 'product:read',
  PRODUCT_CREATE = 'product:create',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  PRODUCT_MANAGE_ALL = 'product:manage_all',
  SUBSCRIPTION_READ = 'subscription:read',
  SUBSCRIPTION_MANAGE = 'subscription:manage',
  DASHBOARD_READ = 'dashboard:read',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.ADMIN]: Object.values(Permission),
  [ROLES.MANAGER]: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_MANAGE_ALL,
  ],
  [ROLES.USER]: [
    Permission.USER_READ,
    Permission.PRODUCT_READ,
  ],
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.ADMIN]: 200,
  [ROLES.MANAGER]: 100,
  [ROLES.USER]: 10,
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};

export const isRoleHigherThan = (roleA: UserRole, roleB: UserRole): boolean => {
  return ROLE_HIERARCHY[roleA] > ROLE_HIERARCHY[roleB];
};

export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};
