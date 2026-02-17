import { apiSlice } from '@/features/api/apiSlice';
import { UpdateSettingsInput, ISettings } from '@rental/shared';

interface SettingsResponse {
  success: boolean;
  message?: string;
  data: ISettings;
}

/**
 * SETTINGS API SLICE
 */
export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<SettingsResponse, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<SettingsResponse, UpdateSettingsInput>({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApiSlice;
