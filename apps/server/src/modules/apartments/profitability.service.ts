import { Apartment, IApartmentDocument } from './apartment.model';
import { Booking } from '../bookings/booking.model';
import { Expense } from '../expenses/expense.model';
import type { RentalTypeValue } from '@rental/shared';

/**
 * Profitability Report — the typed output of the calculation engine.
 */
export interface ProfitabilityReport {
  apartmentId: string;
  apartmentName: string;
  rentalType: RentalTypeValue;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  bookingCount: number;
}

/**
 * Custom error for profitability calculation failures
 */
export class ProfitabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfitabilityError';
  }
}

/**
 * Profitability Service
 *
 * Implements the financial engine for 3 economic models:
 *
 * OWNED_MONTHLY:  Revenue = monthlyRent × months in period.  Expenses = sum of linked expenses.
 * OWNED_DAILY:    Revenue = sum of confirmed/completed booking totalPrice.  Expenses = sum of linked expenses.
 * COMMISSION_BASED: Revenue = sum of booking totalPrice × commissionPercentage / 100.  Expenses = $0.
 */
export class ProfitabilityService {
  /**
   * Calculate profitability for a specific apartment over a date range.
   *
   * @param apartmentId - The apartment to calculate for
   * @param startDate   - Period start (inclusive)
   * @param endDate     - Period end (inclusive)
   */
  static async calculateProfitability(
    apartmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProfitabilityReport> {
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      throw new ProfitabilityError(`Apartment with ID ${apartmentId} not found`);
    }

    const rentalType = apartment.rentalType as RentalTypeValue;

    const [totalRevenue, bookingCount] = await this.calculateRevenue(
      apartment,
      rentalType,
      startDate,
      endDate
    );

    const totalExpenses = await this.calculateExpenses(
      apartmentId,
      rentalType,
      startDate,
      endDate
    );

    return {
      apartmentId,
      apartmentName: apartment.name,
      rentalType,
      period: { startDate, endDate },
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      bookingCount,
    };
  }

  /**
   * Revenue calculation — dispatches by rental type.
   * Returns [totalRevenue, bookingCount].
   */
  private static async calculateRevenue(
    apartment: IApartmentDocument,
    rentalType: RentalTypeValue,
    startDate: Date,
    endDate: Date
  ): Promise<[number, number]> {
    switch (rentalType) {
      case 'OWNED_MONTHLY':
        return this.calculateMonthlyRevenue(apartment, startDate, endDate);

      case 'OWNED_DAILY':
        return this.calculateBookingRevenue(apartment._id.toString(), startDate, endDate, 100);

      case 'COMMISSION_BASED':
        return this.calculateBookingRevenue(
          apartment._id.toString(),
          startDate,
          endDate,
          apartment.commissionPercentage ?? 0
        );

      default:
        throw new ProfitabilityError(`Unknown rentalType: ${rentalType}`);
    }
  }

  /**
   * OWNED_MONTHLY: Revenue = monthlyRent × number of months in period.
   * Calculates months as the difference between start and end (fractional months rounded up).
   */
  private static async calculateMonthlyRevenue(
    apartment: IApartmentDocument,
    startDate: Date,
    endDate: Date
  ): Promise<[number, number]> {
    const monthlyRent = apartment.monthlyRent ?? apartment.price ?? 0;

    const months = this.calculateMonthSpan(startDate, endDate);
    const revenue = monthlyRent * months;

    // For monthly contracts, "bookingCount" represents months
    return [revenue, 0];
  }

  /**
   * Booking-based revenue calculation.
   * For OWNED_DAILY: revenuePercent = 100 (full booking price).
   * For COMMISSION_BASED: revenuePercent = commissionPercentage.
   *
   * Only counts CONFIRMED or COMPLETED bookings that overlap with the queried period.
   */
  private static async calculateBookingRevenue(
    apartmentId: string,
    startDate: Date,
    endDate: Date,
    revenuePercent: number
  ): Promise<[number, number]> {
    const result = await Booking.aggregate([
      {
        $match: {
          apartment: await this.toObjectId(apartmentId),
          status: { $in: ['CONFIRMED', 'COMPLETED'] },
          // Overlap: booking.startDate < periodEnd AND booking.endDate > periodStart
          startDate: { $lt: endDate },
          endDate: { $gt: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
    ]);

    const bookingTotal = result[0]?.total ?? 0;
    const bookingCount = result[0]?.count ?? 0;
    const revenue = bookingTotal * (revenuePercent / 100);

    return [revenue, bookingCount];
  }

  /**
   * Expense calculation.
   * COMMISSION_BASED apartments always return $0 (agency pays nothing).
   * For other types, sums all expenses linked to the apartment within the date range.
   */
  private static async calculateExpenses(
    apartmentId: string,
    rentalType: RentalTypeValue,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Agency pays ZERO expenses for commission-based properties
    if (rentalType === 'COMMISSION_BASED') {
      return 0;
    }

    const result = await Expense.aggregate([
      {
        $match: {
          apartment: await this.toObjectId(apartmentId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return result[0]?.total ?? 0;
  }

  /**
   * Calculate the number of months between two dates.
   * Uses calendar-month difference; minimum 1 month.
   */
  private static calculateMonthSpan(startDate: Date, endDate: Date): number {
    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    const totalMonths = yearDiff * 12 + monthDiff;

    // If end day >= start day, count as full month, otherwise partial
    const dayAdjustment = endDate.getDate() >= startDate.getDate() ? 1 : 0;

    return Math.max(1, totalMonths + dayAdjustment);
  }

  /**
   * Convert string to Mongoose ObjectId for aggregate pipelines.
   */
  private static async toObjectId(id: string) {
    const mongoose = await import('mongoose');
    return new mongoose.Types.ObjectId(id);
  }
}
