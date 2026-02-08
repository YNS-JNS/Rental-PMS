import { apiSlice } from '@/features/api/apiSlice';
import { ITenant, TenantInput } from '@rental/shared';

/**
 * TENANTS API SLICE
 * Injects endpoints for tenant management into the main API slice.
 * Uses Tag Validation for automatic cache updates.
 */
export const tenantsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET All Tenants
    getTenants: builder.query<ITenant[], void>({
      query: () => '/tenants',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Tenant' as const, id: _id })),
              { type: 'Tenant', id: 'LIST' },
            ]
          : [{ type: 'Tenant', id: 'LIST' }],
    }),

    // GET Single Tenant
    getTenant: builder.query<ITenant, string>({
      query: (id) => `/tenants/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tenant', id }],
    }),

    // CREATE Tenant
    createTenant: builder.mutation<ITenant, TenantInput>({
      query: (newTenant) => ({
        url: '/tenants',
        method: 'POST',
        body: newTenant,
      }),
      invalidatesTags: [{ type: 'Tenant', id: 'LIST' }],
    }),

    // UPDATE Tenant
    updateTenant: builder.mutation<ITenant, { id: string; data: Partial<TenantInput> }>({
      query: ({ id, data }) => ({
        url: `/tenants/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Tenant', id },
        { type: 'Tenant', id: 'LIST' },
      ],
    }),

    // DELETE Tenant
    deleteTenant: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/tenants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Tenant', id },
        { type: 'Tenant', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetTenantsQuery,
  useGetTenantQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
} = tenantsApiSlice;
