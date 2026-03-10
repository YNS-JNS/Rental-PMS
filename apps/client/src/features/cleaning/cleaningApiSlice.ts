import { apiSlice } from '@/features/api/apiSlice';
import type {
  ICleaningTask,
  CleaningTaskStatusType,
  UpdateCleaningStatusInput,
  AssignCleanerInput,
  CreateCleaningTaskInput,
} from '@rental/shared';

// ============================================
// Filter Interface
// ============================================

export interface CleaningTaskFilters {
  status?: CleaningTaskStatusType;
  assignedTo?: string;
  apartmentId?: string;
}

// ============================================
// API Response Envelope
// ============================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ============================================
// Cleaning API Slice
// ============================================

export const cleaningApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /api/cleaning-tasks (with optional filters)
    getCleaningTasks: builder.query<ICleaningTask[], CleaningTaskFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
        if (filters?.apartmentId) params.append('apartmentId', filters.apartmentId);
        const qs = params.toString();
        return `/cleaning-tasks${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: ApiResponse<ICleaningTask[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Cleaning' as const, id: _id })),
              { type: 'Cleaning', id: 'LIST' },
            ]
          : [{ type: 'Cleaning', id: 'LIST' }],
    }),

    // GET /api/cleaning-tasks/my-tasks
    getMyCleaningTasks: builder.query<ICleaningTask[], void>({
      query: () => '/cleaning-tasks/my-tasks',
      transformResponse: (response: ApiResponse<ICleaningTask[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Cleaning' as const, id: _id })),
              { type: 'Cleaning', id: 'MY_LIST' },
            ]
          : [{ type: 'Cleaning', id: 'MY_LIST' }],
    }),

    // GET /api/cleaning-tasks/:id
    getCleaningTask: builder.query<ICleaningTask, string>({
      query: (id) => `/cleaning-tasks/${id}`,
      transformResponse: (response: ApiResponse<ICleaningTask>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Cleaning', id }],
    }),

    // PATCH /api/cleaning-tasks/:id/status
    updateCleaningStatus: builder.mutation<
      ICleaningTask,
      { id: string } & UpdateCleaningStatusInput
    >({
      query: ({ id, ...body }) => ({
        url: `/cleaning-tasks/${id}/status`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<ICleaningTask>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Cleaning', id },
        { type: 'Cleaning', id: 'LIST' },
        { type: 'Cleaning', id: 'MY_LIST' },
      ],
    }),

    // PATCH /api/cleaning-tasks/:id/assign
    assignCleaner: builder.mutation<
      ICleaningTask,
      { id: string } & AssignCleanerInput
    >({
      query: ({ id, ...body }) => ({
        url: `/cleaning-tasks/${id}/assign`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<ICleaningTask>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Cleaning', id },
        { type: 'Cleaning', id: 'LIST' },
        { type: 'Cleaning', id: 'MY_LIST' },
      ],
    }),

    // DELETE /api/cleaning-tasks/:id
    deleteCleaningTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/cleaning-tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Cleaning', id },
        { type: 'Cleaning', id: 'LIST' },
      ],
    }),

    // POST /api/cleaning-tasks (manual creation)
    createCleaningTask: builder.mutation<ICleaningTask, CreateCleaningTaskInput>({
      query: (body) => ({
        url: '/cleaning-tasks',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<ICleaningTask>) => response.data,
      invalidatesTags: [{ type: 'Cleaning', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCleaningTasksQuery,
  useGetMyCleaningTasksQuery,
  useGetCleaningTaskQuery,
  useUpdateCleaningStatusMutation,
  useAssignCleanerMutation,
  useDeleteCleaningTaskMutation,
  useCreateCleaningTaskMutation,
} = cleaningApiSlice;
