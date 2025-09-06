import { baseApi } from "../baseApi";

const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllExpense: builder.query({
      query: (query) => ({
        url: '/expenses',
        method: 'GET',
        params: query
      }),
      providesTags: ['expense']
    }),
    createExpense: builder.mutation({
      query: (payload) => ({
        url: '/expenses',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['expense']
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['expense']
    }),
    updateExpense: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        body: payload
      }),
      invalidatesTags: ['expense']
    }),
    yearlyExpense: builder.query({
      query: () => ({
        url: `/expenses/years`,
        method: 'GET'
      }),
      providesTags: ['expense']
    }),
    monthlyExpense: builder.query({
      query: () => ({
        url: `/expenses/months`,
        method: 'GET'
      }),
      providesTags: ['expense']
    }),
    weeklyExpense: builder.query({
      query: () => ({
        url: `/expenses/weeks`,
        method: 'GET'
      }),
      providesTags: ['expense']
    }),
    dailyExpense: builder.query({
      query: () => ({
        url: `/expenses/days`,
        method: 'GET'
      }),
      providesTags: ['expense']
    }),
  })
})

export const {
useGetAllExpenseQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseMutation,
  useYearlyExpenseQuery,
  useMonthlyExpenseQuery,
  useWeeklyExpenseQuery,
  useDailyExpenseQuery } = expenseApi