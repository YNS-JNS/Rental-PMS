import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '@/features/api/apiSlice';
import authReducer from '@/features/auth/authSlice';

/**
 * REDUX STORE CONFIGURATION
 * Central hub for State (Auth) and Data Fetching (RTK Query).
 */
export const store = configureStore({
  reducer: {
    // 1. Add the API reducer (handles cache & request status)
    [apiSlice.reducerPath]: apiSlice.reducer,

    // 2. Add the Auth reducer (handles user & token)
    auth: authReducer,
  },

  // Adding the api middleware enables caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),

  devTools: process.env.NODE_ENV !== 'production',
});

// setupListeners allows for behavior like refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
