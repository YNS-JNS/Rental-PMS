import type { RentalTypeValue } from '@rental/shared';

/**
 * Response shape from GET /api/apartments/:id/profitability
 */
export interface ProfitabilityData {
  rentalType: RentalTypeValue;
  period: { startDate: string; endDate: string };
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}
