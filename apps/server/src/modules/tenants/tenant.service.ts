import { Tenant, ITenantDocument } from './tenant.model';
import { TenantInput } from '@rental/shared';

/**
 * Tenant Service
 * Handles business logic and database interactions for Tenants.
 */
export class TenantService {

  // Create a new tenant
  static async create(data: TenantInput): Promise<ITenantDocument> {
    return Tenant.create(data);
  }

  // Get all tenants (sorted by creation date, newest first)
  static async findAll(): Promise<ITenantDocument[]> {
    return Tenant.find().sort({ createdAt: -1 });
  }

  // Get single tenant by ID
  static async findById(id: string): Promise<ITenantDocument | null> {
    return Tenant.findById(id);
  }

  // Update tenant
  static async update(id: string, data: Partial<TenantInput>): Promise<ITenantDocument | null> {
    return Tenant.findByIdAndUpdate(id, data, { new: true });
  }

  // Delete tenant
  static async delete(id: string): Promise<ITenantDocument | null> {
    return Tenant.findByIdAndDelete(id);
  }

  // Check if email already exists (for validation)
  static async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const query: { email: string; _id?: { $ne: string } } = { email: email.toLowerCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const tenant = await Tenant.findOne(query);
    return !!tenant;
  }
}
