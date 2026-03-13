import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseInput, ExpenseSchema } from '@rental/shared';
import type { IExpense } from '@rental/shared';
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '../api/expensesApiSlice';
import { useToast } from '@/hooks/use-toast';

interface UseExpenseFormOptions {
  editTarget?: IExpense;
  open: boolean;
  onSuccess: () => void;
}

/**
 * useExpenseForm
 *
 * FIX (this round): apartmentId default value is `undefined`, NOT `''`.
 * The ExpenseSchema validates apartmentId against a MongoDB ObjectId regex.
 * An empty string `''` passes z.string() but fails the regex, triggering
 * a Zod validation error "Invalid apartment ID format" even though the
 * field is optional. Using `undefined` correctly satisfies `.optional()`.
 */
export function useExpenseForm({ editTarget, open, onSuccess }: UseExpenseFormOptions) {
  const { toast } = useToast();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const isLoading = isCreating || isUpdating;
  const isEditMode = !!editTarget;

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      // CRITICAL: do NOT default apartmentId to ''. The Zod regex validation
      // runs before our onSubmit normalization, and '' fails the ObjectId regex.
      apartmentId: undefined,
      amount: 0,
      category: 'OTHER',
      date: new Date(),
      description: '',
    },
  });

  /**
   * Single source of truth for form reset.
   * Triggers whenever the dialog opens OR the target expense changes.
   */
  useEffect(() => {
    if (!open) return;

    if (editTarget) {
      form.reset({
        // If the stored apartmentId is an empty string (bad data), normalize it
        apartmentId: editTarget.apartment?._id || undefined,
        amount: editTarget.amount,
        category: editTarget.category,
        date: new Date(editTarget.date),
        description: editTarget.description ?? '',
      });
    } else {
      form.reset({
        apartmentId: undefined,
        amount: 0,
        category: 'OTHER',
        date: new Date(),
        description: '',
      });
    }
  }, [open, editTarget, form]);

  const onSubmit = useCallback(async (values: ExpenseInput) => {
    try {
      const payload: ExpenseInput = {
        ...values,
        amount: Number(values.amount),
        // Normalize: undefined is already correct, but guard against bad state
        apartmentId: values.apartmentId || undefined,
        description: values.description?.trim() || undefined,
      };

      if (isEditMode && editTarget) {
        await updateExpense({ id: editTarget._id, data: payload }).unwrap();
        toast({ title: 'Success', description: 'Expense updated.' });
      } else {
        await createExpense(payload).unwrap();
        toast({ title: 'Success', description: 'Expense recorded.' });
      }

      onSuccess();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: isEditMode
          ? 'Failed to update expense.'
          : 'Failed to record expense.',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editTarget?._id, createExpense, updateExpense, toast, onSuccess]);

  return { form, onSubmit, isLoading, isEditMode };
}
