import { apiSlice } from '@/features/api/apiSlice';
import type { IPayment, PaymentInput } from '@rental/shared';

/**
 * Finance API Slice
 * Injects payment endpoints into the main apiSlice.
 */
export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /api/payments/booking/:bookingId
     * Returns all payments for a specific booking
     */
    getPaymentsByBooking: builder.query<IPayment[], string>({
      query: (bookingId) => `/payments/booking/${bookingId}`,
      providesTags: (result, _error, bookingId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Payment' as const, id: _id })),
              { type: 'Payment', id: `BOOKING_${bookingId}` },
            ]
          : [{ type: 'Payment', id: `BOOKING_${bookingId}` }],
    }),

    /**
     * POST /api/payments
     * Record a new payment
     */
    createPayment: builder.mutation<IPayment, PaymentInput>({
      query: (body) => ({
        url: '/payments',
        method: 'POST',
        body,
      }),
      // Invalidate both Payment and Booking caches
      // because creating a payment updates booking.paymentStatus
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Payment', id: `BOOKING_${arg.bookingId}` },
        { type: 'Booking' },
      ],
    }),

    /**
     * DELETE /api/payments/:id
     * Delete a payment (recalculates booking status)
     */
    deletePayment: builder.mutation<{ message: string; payment: IPayment }, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'DELETE',
      }),
      // Invalidate all Payment + Booking caches
      invalidatesTags: [{ type: 'Payment' }, { type: 'Booking' }],
    }),
  }),
});

export const {
  useGetPaymentsByBookingQuery,
  useCreatePaymentMutation,
  useDeletePaymentMutation,
} = financeApiSlice;
