import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as userService from '../services/userService';

// Roles a given role can manage
const MANAGEABLE_ROLES: Record<string, string[]> = {
  OWNER: ['MANAGER', 'STAFF'],
  MANAGER: ['STAFF'],
  STAFF: [],
};

function canManageRole(actorRole: string, targetRole: string): boolean {
  return (MANAGEABLE_ROLES[actorRole] || []).includes(targetRole);
}

export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const role = req.user!.role;
    const visibleRoles = MANAGEABLE_ROLES[role];

    if (!visibleRoles || visibleRoles.length === 0) {
      res.status(403).json({ error: 'You do not have permission to list users' });
      return;
    }

    const users = await userService.getUsersByRoles(visibleRoles);
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const role = req.user!.role;
    const id = parseInt(req.params.id);
    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Staff can only view themselves
    if (role === 'STAFF' && req.user!.userId !== id) {
      res.status(403).json({ error: 'You do not have permission to view this user' });
      return;
    }

    if (role !== 'STAFF' && !canManageRole(role, user.role)) {
      res.status(403).json({ error: 'You do not have permission to view this user' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, name, password, role } = req.body;

    if (!canManageRole(req.user!.role, role)) {
      res.status(403).json({ error: `You do not have permission to create ${role} users` });
      return;
    }

    const user = await userService.createUser({ email, name, password, role });
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const actorRole = req.user!.role;
    const id = parseInt(req.params.id);

    // Staff can only update themselves
    if (actorRole === 'STAFF') {
      if (req.user!.userId !== id) {
        res.status(403).json({ error: 'You can only update your own profile' });
        return;
      }
      // Staff cannot change their own role
      if (req.body.role) {
        res.status(403).json({ error: 'You cannot change your own role' });
        return;
      }
    } else {
      const targetUser = await userService.getUserById(id);
      if (!targetUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      if (!canManageRole(actorRole, targetUser.role)) {
        res.status(403).json({ error: 'You do not have permission to update this user' });
        return;
      }
    }

    const user = await userService.updateUser(id, req.body);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const targetUser = await userService.getUserById(id);

    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!canManageRole(req.user!.role, targetUser.role)) {
      res.status(403).json({ error: 'You do not have permission to delete this user' });
      return;
    }

    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
