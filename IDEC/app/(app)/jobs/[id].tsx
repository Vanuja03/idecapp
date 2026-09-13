import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Snackbar, TextInput } from 'react-native-paper';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusDropdown } from '@/components/StatusDropdown';
import { VehicleDropdown } from '@/components/VehicleDropdown';
import { palette, spacing } from '@/constants/theme';
import { useDailyJobs, useDeleteJob, useJob, useUpdateJob, useVehicles } from '@/hooks/use-logistics';
import { jobSchema, JobForm } from '@/schemas/forms';
import { JobStatus } from '@/types';
import { formatDateTime, userName } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';
import { useAuth } from '@/store/auth';
import { canDeleteJob, canUpdateJob } from '@/utils/permissions';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const jobQuery = useJob(id);
  const vehiclesQuery = useVehicles(true, canUpdateJob(user?.role));
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobDate: '',
      vehicleId: '',
      destination: '',
      status: JobStatus.PENDING,
      notes: '',
    },
  });

  useEffect(() => {
    if (!jobQuery.data) return;
    form.reset({
      jobDate: jobQuery.data.jobDate,
      vehicleId: typeof jobQuery.data.vehicleId === 'string' ? jobQuery.data.vehicleId : String(jobQuery.data.vehicleId),
      destination: jobQuery.data.destination,
      status: jobQuery.data.status,
      notes: jobQuery.data.notes ?? '',
    });
  }, [jobQuery.data, form]);

  const jobDate = jobQuery.data?.jobDate;
  const dayQuery = useDailyJobs(jobDate ?? '');
  const locked = dayQuery.data?.status === 'FINALIZED';
  const canEdit = canUpdateJob(user?.role) && !locked;
  const canDelete = canDeleteJob(user?.role) && !locked;

  if (jobQuery.isLoading) return <LoadingState label="Loading job…" />;
  if (jobQuery.isError || !jobQuery.data) {
    return (
      <ErrorState
        title="Unable to load this job."
        message={getErrorMessage(jobQuery.error, 'Please check your connection.')}
        onRetry={() => jobQuery.refetch()}
      />
    );
  }

  const onSave = form.handleSubmit(async (values) => {
    try {
      await updateJob.mutateAsync({
        id: jobQuery.data._id,
        payload: values,
      });
      setSnack('Job updated');
      router.back();
    } catch (error) {
      setSnack(getErrorMessage(error, 'This job cannot be edited because the day has been finalized.'));
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.meta}>Created by {userName(jobQuery.data.createdBy)}</Text>
      <Text style={styles.meta}>Last updated {formatDateTime(jobQuery.data.updatedAt)}</Text>
      {locked ? (
        <ErrorState title="This job cannot be edited because the day has been finalized." />
      ) : null}

      <Text style={styles.date}>Job date: {jobQuery.data.jobDate}</Text>
      {!canEdit ? (
        <Text style={styles.date}>Vehicle: {jobQuery.data.vehicleNumberSnapshot}</Text>
      ) : null}

      {canEdit ? (
        <Controller
          control={form.control}
          name="vehicleId"
          render={({ field: { value, onChange } }) => (
            <VehicleDropdown
              vehicles={vehiclesQuery.data ?? []}
              value={value}
              onChange={onChange}
              error={form.formState.errors.vehicleId?.message}
              disabled={!canEdit}
            />
          )}
        />
      ) : null}

      {canEdit ? (
        <Controller
          control={form.control}
          name="status"
          render={({ field: { value, onChange } }) => (
            <StatusDropdown value={value} onChange={onChange} disabled={!canEdit} />
          )}
        />
      ) : (
        <StatusBadge status={jobQuery.data.status} />
      )}

      <Controller
        control={form.control}
        name="destination"
        render={({ field: { value, onChange } }) => (
          <TextInput label="Destination" mode="outlined" value={value} onChangeText={onChange} disabled={!canEdit} />
        )}
      />

      <Controller
        control={form.control}
        name="notes"
        render={({ field: { value, onChange } }) => (
          <TextInput label="Notes" mode="outlined" multiline value={value} onChangeText={onChange} disabled={!canEdit} />
        )}
      />

      {canEdit ? (
        <Button mode="contained" onPress={onSave} loading={updateJob.isPending}>
          Save changes
        </Button>
      ) : null}
      {canDelete ? (
        <Button mode="contained" buttonColor={palette.error} onPress={() => setConfirmDelete(true)}>
          Delete Job
        </Button>
      ) : null}

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete this job?"
        message="This cannot be undone."
        confirmLabel="Delete"
        loading={deleteJob.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await deleteJob.mutateAsync({ id: jobQuery.data._id, date: jobQuery.data.jobDate });
            setConfirmDelete(false);
            router.back();
          } catch (error) {
            setConfirmDelete(false);
            setSnack(getErrorMessage(error, 'Unable to delete this job.'));
          }
        }}
      />
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)}>
        {snack}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, backgroundColor: palette.surface },
  meta: { color: palette.muted },
  date: { fontWeight: '700', color: palette.navy },
});
