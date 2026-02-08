import { Request, Response } from 'express';
import { TenantService } from './tenant.service';
import { TenantSchema } from '@rental/shared';

/**
 * Tenant Controller
 * Handles HTTP requests for Tenant resources.
 */
export class TenantController {

  // POST /api/tenants
  static async create(req: Request, res: Response) {
    try {
      // Validate request body with Zod
      const validationResult = TenantSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        });
      }

      // Check for duplicate email
      const emailExists = await TenantService.emailExists(validationResult.data.email);
      if (emailExists) {
        return res.status(409).json({ message: 'A tenant with this email already exists' });
      }

      const tenant = await TenantService.create(validationResult.data);
      res.status(201).json(tenant);
    } catch (error) {
      res.status(500).json({ message: 'Error creating tenant', error });
    }
  }

  // GET /api/tenants
  static async findAll(_req: Request, res: Response) {
    try {
      const tenants = await TenantService.findAll();
      res.status(200).json(tenants);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tenants', error });
    }
  }

  // GET /api/tenants/:id
  static async findOne(req: Request, res: Response) {
    try {
      const tenant = await TenantService.findById(req.params.id);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      res.status(200).json(tenant);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tenant', error });
    }
  }

  // PUT /api/tenants/:id
  static async update(req: Request, res: Response) {
    try {
      // Validate request body (partial validation for updates)
      const validationResult = TenantSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        });
      }

      // Check for duplicate email if email is being updated
      if (validationResult.data.email) {
        const emailExists = await TenantService.emailExists(
          validationResult.data.email,
          req.params.id
        );
        if (emailExists) {
          return res.status(409).json({ message: 'A tenant with this email already exists' });
        }
      }

      const tenant = await TenantService.update(req.params.id, validationResult.data);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      res.status(200).json(tenant);
    } catch (error) {
      res.status(500).json({ message: 'Error updating tenant', error });
    }
  }

  // DELETE /api/tenants/:id
  static async delete(req: Request, res: Response) {
    try {
      const tenant = await TenantService.delete(req.params.id);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      res.status(200).json({ message: 'Tenant deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting tenant', error });
    }
  }
}
