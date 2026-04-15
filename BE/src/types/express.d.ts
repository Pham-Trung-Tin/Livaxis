export {};

import type { UserRole } from '../constants/roles';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
    }

    interface Request {
      user?: User;
    }
  }
}