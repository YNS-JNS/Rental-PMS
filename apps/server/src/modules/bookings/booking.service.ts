import { Booking, IBookingDocument } from './booking.model';
import { Apartment } from '../apartments/apartment.model';
import { Tenant } from '../tenants/tenant.model';
import { BookingInput, BookingStatusType } from '@rental/shared';
import { CleaningTaskService } from '../cleaning/cleaningTask.service';

/**
 * Custom error for booking conflicts
 */
export class BookingConflictError extends Error {
  constructor(message: string = 'Apartment is not available for the selected dates') {
    super(message);
    this.name = 'BookingConflictError';
  }
}

/**
 * Custom error for not found resources
 */
export class ResourceNotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`);
    this.name = 'ResourceNotFoundError';
  }
}

/**
 * Booking Service
 * Handles business logic and database interactions for Bookings.
 * Implements anti-double booking logic.
 */
export class BookingService {

  /**
   * Check if an apartment is available for the given date range
   * Uses overlap logic: (StartA < EndB) && (EndA > StartB)
   * @param apartmentId - The apartment to check
   * @param startDate - Booking start date
   * @param endDate - Booking end date
   * @param excludeBookingId - Optional booking ID to exclude (for updates)
   * @returns true if available, false if overlapping booking exists
   */
  static async checkAvailability(
    apartmentId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    const query: any = {
      apartment: apartmentId,
      status: { $in: ['PENDING', 'CONFIRMED'] }, // Only active bookings block
      // Overlap check: existing booking overlaps if:
      // existing.startDate < newEndDate AND existing.endDate > newStartDate
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    };

    // Exclude current booking when updating
    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const conflictingBooking = await Booking.findOne(query);
    return !conflictingBooking; // Available if no conflict found
  }

  /**
   * Verify that apartment and tenant exist
   */
  static async verifyRelationsExist(apartmentId: string, tenantId: string): Promise<void> {
    const [apartment, tenant] = await Promise.all([
      Apartment.findById(apartmentId),
      Tenant.findById(tenantId),
    ]);

    if (!apartment) {
      throw new ResourceNotFoundError('Apartment', apartmentId);
    }
    if (!tenant) {
      throw new ResourceNotFoundError('Tenant', tenantId);
    }
  }

  /**
   * Create a new booking with availability check
   */
  static async create(data: BookingInput, actorUserId: string): Promise<IBookingDocument> {
    // Verify relations exist
    await this.verifyRelationsExist(data.apartmentId, data.tenantId);

    // Check availability
    const isAvailable = await this.checkAvailability(
      data.apartmentId,
      new Date(data.startDate),
      new Date(data.endDate)
    );

    if (!isAvailable) {
      throw new BookingConflictError();
    }

    // Create booking with mapped field names
    const newBooking = await Booking.create({
      apartment: data.apartmentId,
      tenant: data.tenantId,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      totalPrice: data.totalPrice,
      guestCount: data.guestCount,
      notes: data.notes,
    });

    // Automation: generate cleaning task for confirmed bookings
    const effectiveStatus = data.status || 'CONFIRMED';
    if (effectiveStatus === 'CONFIRMED') {
      try {
        await CleaningTaskService.createFromBooking(newBooking, actorUserId);
      } catch {
        // Non-blocking: log but don't fail the booking creation
        console.error('[CleaningTask] Failed to auto-create task for booking', newBooking._id);
      }
    }

    return newBooking;
  }

  /**
   * Get all bookings with optional filters
   */
  static async findAll(filters: {
    apartmentId?: string;
    tenantId?: string;
    status?: BookingStatusType;
  } = {}): Promise<IBookingDocument[]> {
    const query: any = {};

    if (filters.apartmentId) query.apartment = filters.apartmentId;
    if (filters.tenantId) query.tenant = filters.tenantId;
    if (filters.status) query.status = filters.status;

    return Booking.find(query)
      .populate('apartment', 'name address')
      .populate('tenant', 'firstName lastName email')
      .sort({ startDate: -1 });
  }

  /**
   * Get single booking by ID with full population
   */
  static async findById(id: string): Promise<IBookingDocument | null> {
    return Booking.findById(id)
      .populate('apartment')
      .populate('tenant');
  }

  /**
   * Update booking with availability re-check if dates change
   */
  static async update(
    id: string,
    data: Partial<BookingInput>,
    actorUserId: string
  ): Promise<IBookingDocument | null> {
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) return null;

    // Check if dates are being changed
    const datesChanging = 
      (data.startDate && new Date(data.startDate).getTime() !== existingBooking.startDate.getTime()) ||
      (data.endDate && new Date(data.endDate).getTime() !== existingBooking.endDate.getTime());

    // Check if apartment is changing
    const apartmentChanging = data.apartmentId && data.apartmentId !== existingBooking.apartment.toString();

    // Re-check availability if dates or apartment change
    if (datesChanging || apartmentChanging) {
      const apartmentToCheck = data.apartmentId || existingBooking.apartment.toString();
      const startToCheck = data.startDate ? new Date(data.startDate) : existingBooking.startDate;
      const endToCheck = data.endDate ? new Date(data.endDate) : existingBooking.endDate;

      const isAvailable = await this.checkAvailability(
        apartmentToCheck,
        startToCheck,
        endToCheck,
        id // Exclude current booking
      );

      if (!isAvailable) {
        throw new BookingConflictError();
      }
    }

    // Build update object with proper field mapping
    const updateData: any = {};
    if (data.apartmentId) updateData.apartment = data.apartmentId;
    if (data.tenantId) updateData.tenant = data.tenantId;
    if (data.startDate) updateData.startDate = data.startDate;
    if (data.endDate) updateData.endDate = data.endDate;
    if (data.status) updateData.status = data.status;
    if (data.totalPrice !== undefined) updateData.totalPrice = data.totalPrice;
    if (data.guestCount !== undefined) updateData.guestCount = data.guestCount;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, { new: true })
      .populate('apartment')
      .populate('tenant');

    // Automation: handle cleaning task lifecycle on status changes
    if (data.status && updatedBooking) {
      try {
        if (data.status === 'CONFIRMED' && existingBooking.status !== 'CONFIRMED') {
          await CleaningTaskService.createFromBooking(updatedBooking, actorUserId);
        } else if (data.status === 'CANCELLED') {
          await CleaningTaskService.deleteByBooking(id);
        }
      } catch {
        console.error('[CleaningTask] Failed to sync task for booking', id);
      }
    }

    return updatedBooking;
  }

  /**
   * Soft delete booking (change status to CANCELLED)
   */
  static async softDelete(id: string): Promise<IBookingDocument | null> {
    return Booking.findByIdAndUpdate(
      id,
      { status: 'CANCELLED' },
      { new: true }
    );
  }

  /**
   * Hard delete booking (use with caution)
   */
  static async hardDelete(id: string): Promise<IBookingDocument | null> {
    return Booking.findByIdAndDelete(id);
  }
}
