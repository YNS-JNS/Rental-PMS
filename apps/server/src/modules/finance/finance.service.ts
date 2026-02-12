import { Payment, IPaymentDocument } from './payment.model';
import { Booking } from '../bookings/booking.model';
import { PaymentInput, PaymentStatusType } from '@rental/shared';

/**
 * Custom error for resource not found
 */
export class PaymentNotFoundError extends Error {
  constructor(id: string) {
    super(`Payment with ID ${id} not found`);
    this.name = 'PaymentNotFoundError';
  }
}

export class BookingNotFoundError extends Error {
  constructor(id: string) {
    super(`Booking with ID ${id} not found`);
    this.name = 'BookingNotFoundError';
  }
}

/**
 * Finance Service
 * Handles payment recording and automatic booking payment status updates.
 */
export class FinanceService {

  /**
   * Recalculate and update the payment status of a booking.
   * - totalPaid >= totalPrice → PAID
   * - totalPaid > 0 → PARTIALLY_PAID
   * - else → UNPAID
   */
  private static calculatePaymentStatus(totalPaid: number, totalPrice: number): PaymentStatusType {
    if (totalPaid >= totalPrice) return 'PAID';
    if (totalPaid > 0) return 'PARTIALLY_PAID';
    return 'UNPAID';
  }

  /**
   * Update booking's totalPaid and paymentStatus
   */
  private static async updateBookingPaymentStatus(bookingId: string): Promise<void> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new BookingNotFoundError(bookingId);

    // Sum all payments for this booking
    const result = await Payment.aggregate([
      { $match: { booking: booking._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalPaid = Math.max(0, result[0]?.total || 0); // Floor at 0
    const paymentStatus = this.calculatePaymentStatus(totalPaid, booking.totalPrice);

    booking.totalPaid = totalPaid;
    booking.paymentStatus = paymentStatus;
    await booking.save();
  }

  /**
   * Record a new payment for a booking
   * 1. Verify booking exists
   * 2. Create payment record
   * 3. Update booking totalPaid & paymentStatus
   */
  static async addPayment(data: PaymentInput): Promise<IPaymentDocument> {
    // Verify booking exists
    const booking = await Booking.findById(data.bookingId);
    if (!booking) throw new BookingNotFoundError(data.bookingId);

    // Create payment
    const payment = await Payment.create({
      booking: data.bookingId,
      amount: data.amount,
      date: data.date,
      method: data.method,
      reference: data.reference,
      notes: data.notes,
    });

    // Update booking payment status
    await this.updateBookingPaymentStatus(data.bookingId);

    return payment;
  }

  /**
   * Get all payments for a specific booking
   */
  static async getBookingPayments(bookingId: string): Promise<IPaymentDocument[]> {
    return Payment.find({ booking: bookingId })
      .populate('booking', 'totalPrice totalPaid paymentStatus')
      .sort({ date: -1 });
  }

  /**
   * Get a single payment by ID
   */
  static async getPaymentById(id: string): Promise<IPaymentDocument | null> {
    return Payment.findById(id)
      .populate('booking', 'totalPrice totalPaid paymentStatus');
  }

  /**
   * Delete a payment and recalculate booking payment status
   * Deducts amount from totalPaid (floor at 0)
   */
  static async deletePayment(id: string): Promise<IPaymentDocument | null> {
    const payment = await Payment.findById(id);
    if (!payment) return null;

    const bookingId = payment.booking.toString();

    // Delete the payment
    await Payment.findByIdAndDelete(id);

    // Recalculate booking (aggregate will exclude deleted payment)
    await this.updateBookingPaymentStatus(bookingId);

    return payment;
  }
}
