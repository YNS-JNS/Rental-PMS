import { apiSlice } from '@/features/api/apiSlice';
import { IBooking, BookingInput } from '@rental/shared';

/**
 * Query params for filtering bookings
 */
interface BookingFilters {
  apartmentId?: string;
  tenantId?: string;
  status?: string;
}

/**
 * BOOKINGS API SLICE
 * Injects endpoints for booking management into the main API slice.
 * Uses Tag Invalidation for automatic cache updates.
 */
export const bookingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET All Bookings (with optional filters)
    getBookings: builder.query<IBooking[], BookingFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.apartmentId) params.append('apartmentId', filters.apartmentId);
        if (filters?.tenantId) params.append('tenantId', filters.tenantId);
        if (filters?.status) params.append('status', filters.status);
        const queryString = params.toString();
        return `/bookings${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Booking' as const, id: _id })),
              { type: 'Booking', id: 'LIST' },
            ]
          : [{ type: 'Booking', id: 'LIST' }],
    }),

    // GET Single Booking
    getBooking: builder.query<IBooking, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),

    // CREATE Booking
    createBooking: builder.mutation<IBooking, BookingInput>({
      query: (newBooking) => ({
        url: '/bookings',
        method: 'POST',
        body: newBooking,
      }),
      invalidatesTags: [
        { type: 'Booking', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Cleaning', id: 'LIST' },
      ],
    }),

    // UPDATE Booking
    updateBooking: builder.mutation<IBooking, { id: string; data: Partial<BookingInput> }>({
      query: ({ id, data }) => ({
        url: `/bookings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Cleaning', id: 'LIST' },
      ],
    }),

    // DELETE Booking (Soft delete -> CANCELLED)
    deleteBooking: builder.mutation<{ message: string; booking: IBooking }, string>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = bookingsApiSlice;
