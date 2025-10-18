
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User.model';
import Role, { IRole } from '../models/Role.model';
import Permission, { IPermission } from '../models/Permission.model';

export const authorize = (requiredPermissions: string[]) => async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const user = req.user as IUser; // Explicit type assertion

  try {
    // Fetch the user with their role populated
    const userWithRole = await User.findById(user._id).populate<{ role: IRole }>({ // Explicitly type the populated field
      path: 'role',
      model: Role,
      populate: {
        path: 'permissions',
        model: Permission,
      },
    });

    if (!userWithRole || !userWithRole.role) {
      return res.status(403).json({ message: 'Forbidden: User role not found' });
    }

    const userRole = userWithRole.role; // Now correctly typed as IRole
    const userPermissions = (userRole.permissions as unknown as IPermission[])
      .filter(p => p) // Filter out any null or undefined values
      .map(p => p.name);

    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({ message: 'Internal server error during authorization' });
  }
};
