import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * CUSTOM TYPED HOOKS
 * Use these throughout the app instead of plain `useDispatch` and `useSelector`.
 * This ensures strict type safety for State and Dispatch actions.
 */

// Use this to dispatch actions (e.g., dispatch(loginSuccess(...)))
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Use this to select data from the store (e.g., const user = useAppSelector(state => state.auth.user))
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
