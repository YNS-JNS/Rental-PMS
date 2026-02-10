import { Request, Response } from 'express';
import { BookingService, BookingConflictError, ResourceNotFoundError } from './booking.service';
import { BookingSchema, BookingBaseSchema } from '@rental/shared';
import { StatusCodes } from 'http-status-codes';

/**
 * Booking Controller
 * Handles HTTP requests for Booking resources.
 */
export class BookingController {

  /**
   * POST /api/bookings
   * Create a new booking
   */
  static async create(req: Request, res: Response) {
    try {
      // Validate request body with Zod
      const validationResult = BookingSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        });
      }

      const booking = await BookingService.create(validationResult.data);
      res.status(StatusCodes.CREATED).json(booking);

    } catch (error) {
      if (error instanceof BookingConflictError) {
        return res.status(StatusCodes.CONFLICT).json({ message: error.message });
      }
      if (error instanceof ResourceNotFoundError) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: 'Error creating booking', 
        error: error instanceof Error ? error.message : error 
      });
    }
  }

  /**
   * GET /api/bookings
   * Get all bookings with optional filters
   */
  static async findAll(req: Request, res: Response) {
    try {
      const { apartmentId, tenantId, status } = req.query;
      
      const bookings = await BookingService.findAll({
        apartmentId: apartmentId as string,
        tenantId: tenantId as string,
        status: status as any,
      });
      
      res.status(StatusCodes.OK).json(bookings);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: 'Error fetching bookings', 
        error: error instanceof Error ? error.message : error 
      });
    }
  }

  /**
   * GET /api/bookings/:id
   * Get single booking with populated relations
   */
  static async findOne(req: Request, res: Response) {
    try {
      const booking = await BookingService.findById(req.params.id);
      if (!booking) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
      }
      res.status(StatusCodes.OK).json(booking);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: 'Error fetching booking', 
        error: error instanceof Error ? error.message : error 
      });
    }
  }

  /**
   * PUT /api/bookings/:id
   * Update a booking (with availability re-check if dates change)
   */
  static async update(req: Request, res: Response) {
    try {
      // Validate request body (partial for updates - using base schema without refine)
      const validationResult = BookingBaseSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        });
      }

      const booking = await BookingService.update(req.params.id, validationResult.data);
      if (!booking) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
      }
      res.status(StatusCodes.OK).json(booking);

    } catch (error) {
      if (error instanceof BookingConflictError) {
        return res.status(StatusCodes.CONFLICT).json({ message: error.message });
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: 'Error updating booking', 
        error: error instanceof Error ? error.message : error 
      });
    }
  }

  /**
   * DELETE /api/bookings/:id
   * Soft delete (sets status to CANCELLED)
   */
  static async delete(req: Request, res: Response) {
    try {
      const booking = await BookingService.softDelete(req.params.id);
      if (!booking) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
      }
      res.status(StatusCodes.OK).json({ 
        message: 'Booking cancelled successfully',
        booking 
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: 'Error cancelling booking', 
        error: error instanceof Error ? error.message : error 
      });
    }
  }

  /**
   * GET /api/bookings/availability
   * Check availability for an apartment
   */
  static async checkAvailability(req: Request, res: Response) {
    try {
      const { apartmentId, startDate, endDate } = req.query;

      if (!apartmentId || !startDate || !endDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'apartmentId, startDate, and endDate are required',
        });
      }

      const isAvailable = await BookingService.checkAvailability(
        apartmentId as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(StatusCodes.OK).json({ 
        available: isAvailable,
        apartmentId,
        startDate,
        endDate,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: 'Error checking availability', 
        error: error instanceof Error ? error.message : error 
      });
    }
  }
}
