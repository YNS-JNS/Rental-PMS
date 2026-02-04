import { Apartment, IApartmentDocument } from './apartment.model';
import { ApartmentInput } from '@rental/shared';

/**
 * Apartment Service
 * Handles business logic and database interactions for Apartments.
 */
export class ApartmentService {
  
  // Create a new apartment
  static async create(data: ApartmentInput): Promise<IApartmentDocument> {
    const apartment = await Apartment.create(data);
    return apartment;
  }

  // Get all apartments (could add pagination/filtering later)
  static async findAll(): Promise<IApartmentDocument[]> {
    return Apartment.find().sort({ createdAt: -1 });
  }

  // Get single apartment by ID
  static async findById(id: string): Promise<IApartmentDocument | null> {
    return Apartment.findById(id);
  }

  // Update apartment
  static async update(id: string, data: Partial<ApartmentInput>): Promise<IApartmentDocument | null> {
    return Apartment.findByIdAndUpdate(id, data, { new: true });
  }

  // Delete apartment
  static async delete(id: string): Promise<IApartmentDocument | null> {
    return Apartment.findByIdAndDelete(id);
  }
}