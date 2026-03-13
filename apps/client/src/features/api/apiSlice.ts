import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { env } from '@/config/env';
import { logOut } from '@/features/auth/authSlice';

/**
 * Base fetch query with credentials: 'include' to send HttpOnly cookies.
 * No more Bearer token injection — cookies are sent automatically by the browser.
 */
const baseQuery = fetchBaseQuery({
  baseUrl: env.API_URL,
  credentials: 'include', // Send cookies with every request
});

/**
 * Mutex to prevent concurrent refresh calls.
 * When multiple requests fail with 401, only one refresh is attempted.
 */
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Enhanced base query with automatic re-authentication.
 *
 * Flow:
 * 1. Try the original request
 * 2. If 401 → attempt /auth/refresh (with mutex)
 * 3. If refresh succeeds → retry original request
 * 4. If refresh fails → dispatch logOut and redirect to /login
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Mutex: if already refreshing, wait for the ongoing refresh
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions,
        );
        if (refreshResult.error) {
          // Refresh failed — force logout
          api.dispatch(logOut());
          return false;
        }
        return true;
      })();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      // Retry the original request with new cookies
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

/**
 * BASE API SLICE
 * This is the root for RTK Query. All feature-specific endpoints (auth, bookings...)
 * will use "injectEndpoints" into this slice.
 *
 * Features:
 * - Automatic Base URL handling
 * - HttpOnly cookie authentication (credentials: 'include')
 * - Silent token refresh on 401 with mutex
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Apartment', 'Booking', 'Tenant', 'Payment', 'Settings', 'Staff', 'Cleaning', 'Expense', 'Profitability'],
  endpoints: (_builder) => ({}),
});
