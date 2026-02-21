import { apiSlice } from '../api/apiSlice';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateStaffInput {
  role?: string;
  name?: string;
}

export const staffApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<StaffMember[], void>({
      query: () => '/staff',
      transformResponse: (response: { success: boolean; data: StaffMember[] }) => response.data,
      providesTags: ['Staff'],
    }),
    createStaff: builder.mutation<StaffMember, CreateStaffInput>({
      query: (body) => ({
        url: '/staff',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Staff'],
    }),
    updateStaff: builder.mutation<StaffMember, { id: string; data: UpdateStaffInput }>({
      query: ({ id, data }) => ({
        url: `/staff/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),
    deleteStaff: builder.mutation<void, string>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApiSlice;
