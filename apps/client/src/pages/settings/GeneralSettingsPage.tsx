import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateSettingsInput, UpdateSettingsSchema } from '@rental/shared';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/settings/settingsApiSlice';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const CURRENCIES = [
  { value: 'MAD', label: 'MAD — Moroccan Dirham' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
];

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const { data: settingsData, isLoading, isError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const form = useForm<UpdateSettingsInput>({
    resolver: zodResolver(UpdateSettingsSchema),
    defaultValues: {
      agencyName: '',
      defaultCurrency: 'MAD',
      cancellationPolicy: '',
    },
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (settingsData?.data) {
      form.reset({
        agencyName: settingsData.data.agencyName,
        defaultCurrency: settingsData.data.defaultCurrency,
        cancellationPolicy: settingsData.data.cancellationPolicy,
      });
    }
  }, [settingsData, form]);

  async function onSubmit(values: UpdateSettingsInput) {
    try {
      await updateSettings(values).unwrap();
      toast({
        title: 'Settings saved',
        description: 'Your agency configuration has been updated.',
      });
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to save settings.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-destructive">
          Failed to load settings. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Configuration</CardTitle>
        <CardDescription>Manage your agency's global settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="agencyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agency Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Agency" disabled={isUpdating} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={isUpdating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cancellationPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Policy</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your cancellation policy..."
                      className="min-h-[120px] resize-y"
                      disabled={isUpdating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
