import { apiSlice } from '@/features/api/apiSlice';
import { IApartment, ApartmentInput } from '@rental/shared';

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
      // Determines which 'tags' are attached to the cached data
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
      providesTags: (result, error, id) => [{ type: 'Apartment', id }],
    }),

    // CREATE Apartment
    createApartment: builder.mutation<IApartment, ApartmentInput>({
      query: (newApartment) => ({
        url: '/apartments',
        method: 'POST',
        body: newApartment,
      }),
      // Invalidates the 'LIST' tag, causing 'getApartments' to refetch automatically
      invalidatesTags: [{ type: 'Apartment', id: 'LIST' }],
    }),

    // UPDATE Apartment
    updateApartment: builder.mutation<IApartment, { id: string; data: Partial<ApartmentInput> }>({
      query: ({ id, data }) => ({
        url: `/apartments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Apartment', id },
        { type: 'Apartment', id: 'LIST' },
      ],
    }),

    // DELETE Apartment
    deleteApartment: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/apartments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
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
  useCreateApartmentMutation,
  useUpdateApartmentMutation,
  useDeleteApartmentMutation,
} = apartmentsApiSlice;