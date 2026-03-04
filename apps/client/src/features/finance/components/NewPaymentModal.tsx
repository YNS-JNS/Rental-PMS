import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { useCreatePaymentMutation } from '@/features/finance/financeApiSlice';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';
import { useCurrency } from '@/hooks/useCurrency';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// ============================================
// Form Schema (local, with string date)
// ============================================
const PaymentFormSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CHECK', 'OTHER'], {
    required_error: 'Please select a payment method',
  }),
  date: z.date({ required_error: 'Date is required' }),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof PaymentFormSchema>;

// ============================================
// Method labels
// ============================================
const methodLabels: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CHECK: 'Check',
  OTHER: 'Other',
};

// ============================================
// Props
// ============================================
interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  balanceDue: number;
}

export function NewPaymentModal({ isOpen, onClose, bookingId, balanceDue }: NewPaymentModalProps) {
  const { toast } = useToast();
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const { currency, locale } = useCurrency();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      amount: balanceDue > 0 ? balanceDue : 0,
      method: undefined,
      date: new Date(),
      reference: '',
      notes: '',
    },
  });

  // Reset form when modal opens with new balance
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      await createPayment({
        bookingId,
        amount: values.amount,
        date: values.date,
        method: values.method,
        reference: values.reference || undefined,
        notes: values.notes || undefined,
      }).unwrap();

      toast({
        title: 'Payment Recorded',
        description: `${formatCurrency(values.amount, currency, locale)} payment has been recorded.`,
      });

      form.reset();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.data?.message || 'Could not record payment.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Balance due: <span className="font-semibold text-foreground">{formatCurrency(balanceDue, currency, locale)}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Method */}
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(methodLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference */}
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Check #, Transaction ID..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
