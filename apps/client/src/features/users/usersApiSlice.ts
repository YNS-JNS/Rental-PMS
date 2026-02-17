import { apiSlice } from '@/features/api/apiSlice';
import { UpdateProfileInput, IUserPublic } from '@rental/shared';

interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: IUserPublic;
  };
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * USERS API SLICE
 */
export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<ProfileResponse, UpdateProfileInput>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
    }),
    changePassword: builder.mutation<ChangePasswordResponse, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/users/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const { useUpdateProfileMutation, useChangePasswordMutation } = usersApiSlice;
