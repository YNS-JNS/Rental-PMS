import { apiSlice } from '@/features/api/apiSlice';
import type { IApartment, ApartmentInput } from '@rental/shared';
import type { ProfitabilityData } from './types/apartment.types';

/**
 * APARTMENTS API SLICE
 * Injects endpoints for property management into the main API slice.
 * Uses Tag Validation for automatic cache updates.
 */
export const apartmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET All Apartments
    getApartments: builder.query<IApartment[], void>({
      query: () => '/apartments',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Apartment' as const, id: _id })),
              { type: 'Apartment', id: 'LIST' },
            ]
          : [{ type: 'Apartment', id: 'LIST' }],
    }),

    // GET Single Apartment
    getApartment: builder.query<IApartment, string>({
      query: (id) => `/apartments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Apartment', id }],
    }),

    // GET Profitability for an Apartment
    getProfitability: builder.query<ProfitabilityData, string>({
      query: (id) => `/apartments/${id}/profitability`,
      // Provide both the specific tag (for targeted invalidation) and
      // the LIST tag (so broad expense mutations can invalidate all profitability caches).
      providesTags: (_result, _error, id) => [
        { type: 'Profitability', id },
        { type: 'Profitability', id: 'LIST' },
      ],
    }),

    // CREATE Apartment
    createApartment: builder.mutation<IApartment, ApartmentInput>({
      query: (newApartment) => ({
        url: '/apartments',
        method: 'POST',
        body: newApartment,
      }),
      invalidatesTags: [{ type: 'Apartment', id: 'LIST' }],
    }),

    // UPDATE Apartment
    updateApartment: builder.mutation<IApartment, { id: string; data: Partial<ApartmentInput> }>({
      query: ({ id, data }) => ({
        url: `/apartments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Apartment', id },
        { type: 'Apartment', id: 'LIST' },
        // Invalidate profitability cache when apartment data changes
        { type: 'Profitability', id },
      ],
    }),

    // DELETE Apartment
    deleteApartment: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/apartments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Apartment', id },
        { type: 'Apartment', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetApartmentsQuery,
  useGetApartmentQuery,
  useGetProfitabilityQuery,
  useCreateApartmentMutation,
  useUpdateApartmentMutation,
  useDeleteApartmentMutation,
} = apartmentsApiSlice;