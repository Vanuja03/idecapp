import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Snackbar, TextInput } from 'react-native-paper';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ErrorState } from '@/components/ErrorState';
import { JobTypeDropdown } from '@/components/JobTypeDropdown';
import { JobVehicleFields } from '@/components/JobVehicleFields';
import { LoadingState } from '@/components/LoadingState';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusDropdown } from '@/components/StatusDropdown';
import { palette, spacing } from '@/constants/theme';
import { useDailyJobs, useDeleteJob, useJob, useUpdateJob, useVehicles } from '@/hooks/use-logistics';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { jobFormToPayload, jobSchema, JobForm } from '@/schemas/forms';
import { JobStatus, JobType, VehicleSource } from '@/types';
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
      jobType: JobType.IM,
      vehicleSource: VehicleSource.OWN,
      vehicleId: '',
      otherVehicleNumber: '',
      destination: '',
      status: JobStatus.PENDING,
      notes: '',
    },
  });

  useEffect(() => {
    if (!jobQuery.data) return;
    const job = jobQuery.data;
    const isOther = job.vehicleSource === VehicleSource.OTHER;
    form.reset({
      jobDate: job.jobDate,
      jobType: job.jobType ?? JobType.IM,
      vehicleSource: isOther ? VehicleSource.OTHER : VehicleSource.OWN,
      vehicleId: job.vehicleId ? String(job.vehicleId) : '',
      otherVehicleNumber: isOther ? job.vehicleNumberSnapshot : '',
      destination: job.destination,
      status: job.status,
      notes: job.notes ?? '',
    });
  }, [jobQuery.data, form]);

  const isOtherLorry = form.watch('vehicleSource') === VehicleSource.OTHER;

  const jobDate = jobQuery.data?.jobDate;
  const dayQuery = useDailyJobs(jobDate ?? '');
  const locked = dayQuery.data?.status === 'FINALIZED';
  const canEdit = canUpdateJob(user?.role) && !locked;
  const canDelete = canDeleteJob(user?.role) && !locked;
  const { refetch: refetchJob } = jobQuery;
  const { refetch: refetchDay } = dayQuery;
  const pullToRefresh = usePullToRefresh(
    useCallback(() => Promise.all([refetchJob(), refetchDay()]), [refetchJob, refetchDay]),
  );

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
        payload: jobFormToPayload(values),
      });
      setSnack('Job updated');
      router.back();
    } catch (error) {
      setSnack(getErrorMessage(error, 'This job cannot be edited because the day has been finalized.'));
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl {...pullToRefresh} />}>
      <Text style={styles.meta}>Created by {userName(jobQuery.data.createdBy)}</Text>
      <Text style={styles.meta}>Last updated {formatDateTime(jobQuery.data.updatedAt)}</Text>
      {locked ? (
        <ErrorState title="This job cannot be edited because the day has been finalized." />
      ) : null}

      <Text style={styles.date}>Job date: {jobQuery.data.jobDate}</Text>
      {!canEdit ? (
        <Text style={styles.date}>
          Vehicle: {jobQuery.data.vehicleNumberSnapshot}
          {jobQuery.data.vehicleSource === VehicleSource.OTHER ? ' (Other lorry)' : ''}
        </Text>
      ) : null}
      {!canEdit ? <Text style={styles.date}>Type: {jobQuery.data.jobType ?? JobType.IM}</Text> : null}

      {canEdit ? (
        <JobVehicleFields
          control={form.control}
          errors={form.formState.errors}
          vehicles={vehiclesQuery.data ?? []}
          sourceLocked
        />
      ) : null}

      {canEdit ? (
        <Controller
          control={form.control}
          name="jobType"
          render={({ field: { value, onChange } }) => (
            <JobTypeDropdown value={value} onChange={onChange} error={form.formState.errors.jobType?.message} />
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
          <TextInput
            label={isOtherLorry ? 'Vendor' : 'Notes'}
            placeholder={isOtherLorry ? 'Vendor / owner of the lorry' : undefined}
            mode="outlined"
            multiline
            value={value}
            onChangeText={onChange}
            error={isOtherLorry && Boolean(form.formState.errors.notes)}
            disabled={!canEdit}
          />
        )}
      />
      {isOtherLorry && form.formState.errors.notes ? (
        <Text style={styles.error}>{form.formState.errors.notes.message}</Text>
      ) : null}

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
  error: { color: palette.error },
});
