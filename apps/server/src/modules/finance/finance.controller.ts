import { Request, Response } from 'express';
import { FinanceService, BookingNotFoundError } from './finance.service';
import { PaymentSchema } from '@rental/shared';
import { StatusCodes } from 'http-status-codes';

/**
 * Finance Controller
 * Handles HTTP requests for Payment resources.
 */
export class FinanceController {

  /**
   * POST /api/payments
   * Record a new payment
   */
  static async create(req: Request, res: Response) {
    try {
      const validationResult = PaymentSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        });
      }

      const payment = await FinanceService.addPayment(validationResult.data);
      res.status(StatusCodes.CREATED).json(payment);

    } catch (error) {
      if (error instanceof BookingNotFoundError) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error recording payment',
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * GET /api/payments/booking/:bookingId
   * Get all payments for a booking
   */
  static async findByBooking(req: Request, res: Response) {
    try {
      const payments = await FinanceService.getBookingPayments(req.params.bookingId);
      res.status(StatusCodes.OK).json(payments);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error fetching payments',
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * GET /api/payments/:id
   * Get a single payment by ID
   */
  static async findOne(req: Request, res: Response) {
    try {
      const payment = await FinanceService.getPaymentById(req.params.id);
      if (!payment) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Payment not found' });
      }
      res.status(StatusCodes.OK).json(payment);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error fetching payment',
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * DELETE /api/payments/:id
   * Delete a payment (deducts amount from booking and recalculates status)
   */
  static async delete(req: Request, res: Response) {
    try {
      const payment = await FinanceService.deletePayment(req.params.id);
      if (!payment) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Payment not found' });
      }
      res.status(StatusCodes.OK).json({
        message: 'Payment deleted. Booking payment status updated.',
        payment,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error deleting payment',
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}
