import { apiSlice } from '../api/apiSlice';

interface CleaningTask {
  _id: string;
  apartment: {
    _id: string;
    name: string;
    address: string;
  };
  endDate: string;
  cleaningStatus: string;
  status: string;
}

export const cleaningApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCleaningTasks: builder.query<CleaningTask[], void>({
      query: () => '/tasks/cleaning',
      transformResponse: (response: { success: boolean; data: CleaningTask[] }) => response.data,
      providesTags: ['Cleaning'],
    }),
    markAsClean: builder.mutation<CleaningTask, string>({
      query: (bookingId) => ({
        url: `/tasks/cleaning/${bookingId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Cleaning'],
    }),
  }),
});

export const { useGetCleaningTasksQuery, useMarkAsCleanMutation } = cleaningApiSlice;
