import { Request, Response } from 'express';
import { User } from '../auth/user.model';
import { UserRole } from '@rental/shared';
import jwt from 'jsonwebtoken';

/**
 * Staff Controller
 * CRUD operations for staff management (SUPER_ADMIN only).
 */
export const StaffController = {
  /**
   * GET /api/staff
   * List all users except the requesting user.
   */
  findAll: async (req: Request, res: Response) => {
    try {
      const decoded = req.user as jwt.JwtPayload;
      const users = await User.find({ _id: { $ne: decoded.id } })
        .select('name email role isActive createdAt')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch staff list' });
    }
  },

  /**
   * POST /api/staff
   * Create a new staff member.
   */
  create: async (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
      }

      // Validate role (cannot create another SUPER_ADMIN)
      if (role === UserRole.SUPER_ADMIN) {
        return res.status(403).json({ success: false, message: 'Cannot create a SUPER_ADMIN' });
      }

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      // Check if email already taken
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }

      const user = await User.create({ name, email, password, role });

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: (user as any).createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create staff member' });
    }
  },

  /**
   * PUT /api/staff/:id
   * Update a staff member's role.
   */
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role, name } = req.body;
      const decoded = req.user as jwt.JwtPayload;

      // Prevent self-modification
      if (id === decoded.id) {
        return res.status(403).json({ success: false, message: 'Cannot modify your own account via staff management' });
      }

      // Cannot promote to SUPER_ADMIN
      if (role === UserRole.SUPER_ADMIN) {
        return res.status(403).json({ success: false, message: 'Cannot promote to SUPER_ADMIN' });
      }

      if (role && !Object.values(UserRole).includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      const updateData: Record<string, any> = {};
      if (role) updateData.role = role;
      if (name) updateData.name = name;

      const user = await User.findByIdAndUpdate(id, updateData, { new: true })
        .select('name email role isActive createdAt');

      if (!user) {
        return res.status(404).json({ success: false, message: 'Staff member not found' });
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update staff member' });
    }
  },

  /**
   * DELETE /api/staff/:id
   * Delete a staff member.
   */
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const decoded = req.user as jwt.JwtPayload;

      // Prevent self-deletion
      if (id === decoded.id) {
        return res.status(403).json({ success: false, message: 'Cannot delete your own account' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Staff member not found' });
      }

      // Prevent deleting another SUPER_ADMIN
      if (user.role === UserRole.SUPER_ADMIN) {
        return res.status(403).json({ success: false, message: 'Cannot delete a SUPER_ADMIN' });
      }

      await User.findByIdAndDelete(id);

      res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete staff member' });
    }
  },
};
