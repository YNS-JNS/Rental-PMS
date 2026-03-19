import { useCallback, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseInput, ExpenseSchema } from '@rental/shared';
import type { IExpense } from '@rental/shared';
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '../api/expensesApiSlice';
import { useToast } from '@/hooks/use-toast';

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Sentinel used by Radix Select to represent the "no apartment"
 * (agency-wide expense) choice. Never sent to the API.
 */
export const AGENCY_SENTINEL = '_none';

/** Default category when switching to an agency expense */
const AGENCY_DEFAULT_CATEGORY = 'SOFTWARE' as const;

/** Default category when switching to an apartment expense */
const APARTMENT_DEFAULT_CATEGORY = 'OTHER' as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseExpenseFormOptions {
  editTarget?: IExpense;
  open: boolean;
  onSuccess: () => void;
}

export interface UseExpenseFormReturn {
  form: ReturnType<typeof useForm<ExpenseInput>>;
  onSubmit: (values: ExpenseInput) => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
  /** True when the user has selected the agency option in the apartment selector */
  isAgencyExpense: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useExpenseForm
 *
 * Owns all form state and submission logic for expense create / update.
 *
 * Key behaviours:
 *  - `isAgencyExpense` is derived from the watched apartmentId field.
 *  - Switching between agency/apartment resets `category` to a sensible default.
 *  - On create: agency expenses omit `apartmentId` entirely (backend treats absence as AGENCY).
 *  - On edit:   converting to agency sends `apartmentId: null` explicitly so the
 *               backend's `$unset` path is triggered correctly.
 */
export function useExpenseForm({
  editTarget,
  open,
  onSuccess,
}: UseExpenseFormOptions): UseExpenseFormReturn {
  const { toast } = useToast();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const isLoading = isCreating || isUpdating;
  const isEditMode = !!editTarget;

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      apartmentId: undefined,
      amount: 0,
      category: APARTMENT_DEFAULT_CATEGORY,
      date: new Date(),
      description: '',
    },
  });

  // ── Derive agency state from the live form value ───────────────────────────
  // useWatch is used instead of form.watch() to avoid re-render on every field change.
  const watchedApartmentId = useWatch({ control: form.control, name: 'apartmentId' });
  const isAgencyExpense = !watchedApartmentId || watchedApartmentId === AGENCY_SENTINEL;

  // ── Reset category to a sensible default when expense type changes ─────────
  // This prevents stale category mismatch (e.g. "WATER" on an agency expense).
  useEffect(() => {
    if (isAgencyExpense) {
      form.setValue('category', AGENCY_DEFAULT_CATEGORY, { shouldDirty: false });
    } else {
      form.setValue('category', APARTMENT_DEFAULT_CATEGORY, { shouldDirty: false });
    }
    // Intentionally only re-run when isAgencyExpense flips, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAgencyExpense]);

  // ── Single source of truth for form reset (triggers when dialog opens) ─────
  useEffect(() => {
    if (!open) return;

    if (editTarget) {
      const isEditAgency = !editTarget.apartment?._id;
      form.reset({
        apartmentId: isEditAgency ? undefined : (editTarget.apartment?._id || undefined),
        amount: editTarget.amount,
        category: editTarget.category,
        date: new Date(editTarget.date),
        description: editTarget.description ?? '',
      });
    } else {
      form.reset({
        apartmentId: undefined,
        amount: 0,
        category: APARTMENT_DEFAULT_CATEGORY,
        date: new Date(),
        description: '',
      });
    }
  }, [open, editTarget, form]);

  // ── Submit handler ─────────────────────────────────────────────────────────
  const onSubmit = useCallback(
    async (values: ExpenseInput) => {
      try {
        const isSelectedAgency =
          !values.apartmentId || values.apartmentId === AGENCY_SENTINEL;

        if (isEditMode && editTarget) {
          // For EDIT: if converting to agency expense, send `apartmentId: null`
          // explicitly so the backend's `$unset` path fires. If staying as apartment,
          // send the actual ID. If staying as agency, omit the field.
          const wasAgency = !editTarget.apartment?._id;

          const payload: Record<string, unknown> = {
            amount: Number(values.amount),
            category: values.category,
            date: values.date,
            description: values.description?.trim() || undefined,
          };

          if (isSelectedAgency && !wasAgency) {
            // APARTMENT → AGENCY: explicit null triggers backend $unset
            payload.apartmentId = null;
          } else if (!isSelectedAgency) {
            // Staying as or moving to APARTMENT
            payload.apartmentId = values.apartmentId;
          }
          // AGENCY → AGENCY: don't send apartmentId at all

          await updateExpense({ id: editTarget._id, data: payload }).unwrap();
          toast({ title: 'Success', description: 'Expense updated.' });
        } else {
          // For CREATE: simply omit apartmentId for agency expenses
          const payload: ExpenseInput = {
            amount: Number(values.amount),
            category: values.category,
            date: values.date,
            description: values.description?.trim() || undefined,
            ...(isSelectedAgency ? {} : { apartmentId: values.apartmentId }),
          };

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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEditMode, editTarget?._id, createExpense, updateExpense, toast, onSuccess]
  );

  return { form, onSubmit, isLoading, isEditMode, isAgencyExpense };
}
