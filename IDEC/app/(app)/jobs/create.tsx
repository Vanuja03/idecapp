import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Snackbar, TextInput } from 'react-native-paper';
import { DateSelector } from '@/components/DateSelector';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { StatusDropdown } from '@/components/StatusDropdown';
import { VehicleDropdown } from '@/components/VehicleDropdown';
import { palette, spacing } from '@/constants/theme';
import { useCreateJob, useDailyJobs, useVehicles } from '@/hooks/use-logistics';
import { jobSchema, JobForm } from '@/schemas/forms';
import { JobStatus } from '@/types';
import { todayBusinessDate } from '@/utils/dates';
import { getErrorMessage, getFieldErrors } from '@/utils/errors';
import { useAuth } from '@/store/auth';
import { canCreateJob } from '@/utils/permissions';
import { useState } from 'react';

export default function CreateJobScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const defaultDate = date ?? todayBusinessDate();
  const { user } = useAuth();
  const vehiclesQuery = useVehicles(true);
  const dayQuery = useDailyJobs(defaultDate);
  const createJob = useCreateJob();
  const [snack, setSnack] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobDate: defaultDate,
      vehicleId: '',
      destination: '',
      status: JobStatus.PENDING,
      notes: '',
    },
  });

  const jobDate = watch('jobDate');
  const selectedDay = useDailyJobs(jobDate);
  const locked = selectedDay.data?.status === 'FINALIZED';

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createJob.mutateAsync({
        ...values,
        destination: values.destination.trim(),
        notes: values.notes?.trim(),
      });
      router.back();
    } catch (error) {
      const fields = getFieldErrors(error);
      Object.entries(fields).forEach(([key, message]) => {
        setError(key as keyof JobForm, { message });
      });
      setSnack(getErrorMessage(error, 'Unable to save this job.'));
    }
  });

  if (!canCreateJob(user?.role)) {
    return <ErrorState title="You do not have permission to create jobs." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {vehiclesQuery.isLoading || dayQuery.isLoading ? <LoadingState /> : null}
      {locked ? (
        <ErrorState title="This job cannot be edited because the day has been finalized." />
      ) : null}

      <Controller
        control={control}
        name="jobDate"
        render={({ field: { value, onChange } }) => <DateSelector value={value} onChange={onChange} />}
      />

      <Controller
        control={control}
        name="vehicleId"
        render={({ field: { value, onChange } }) => (
          <VehicleDropdown
            vehicles={vehiclesQuery.data ?? []}
            value={value}
            onChange={onChange}
            error={errors.vehicleId?.message}
            disabled={locked}
          />
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <StatusDropdown value={value} onChange={onChange} disabled={locked} />
        )}
      />

      <Controller
        control={control}
        name="destination"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Destination"
            mode="outlined"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={Boolean(errors.destination)}
            disabled={locked}
          />
        )}
      />
      {errors.destination ? <Text style={styles.error}>{errors.destination.message}</Text> : null}

      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Notes (optional)"
            mode="outlined"
            multiline
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            disabled={locked}
          />
        )}
      />

      <Button mode="contained" onPress={onSubmit} loading={isSubmitting} disabled={isSubmitting || locked}>
        Save Job
      </Button>
      <Button mode="text" onPress={() => router.back()}>
        Cancel
      </Button>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)}>
        {snack}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, backgroundColor: palette.surface },
  error: { color: palette.error },
});
