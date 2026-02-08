import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/app/store';
import { env } from '@/config/env';
/**
 * BASE API SLICE
 * This is the root for RTK Query. All feature-specific endpoints (auth, bookings...)
 * will allow "injectEndpoints" into this slice.
 * * Features:
 * - Automatic Base URL handling
 * - Automatic JWT Token Injection
 */
export const apiSlice = createApi({
  reducerPath: 'api', // The key in the Redux store
  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Access the Redux Store to get the token
      const token = (getState() as RootState).auth.token;

      // If we have a token, inject it into the Authorization header
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  // Tag Types are used for caching invalidation (Automatic refetching)
  tagTypes: ['User', 'Apartment', 'Booking'],
  endpoints: (_builder) => ({}), // Endpoints are injected in feature slices
});
