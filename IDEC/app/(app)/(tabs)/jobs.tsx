import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, FAB, Snackbar } from 'react-native-paper';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DailySummary } from '@/components/DailySummary';
import { DateSelector } from '@/components/DateSelector';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { FinalizeButton } from '@/components/FinalizeButton';
import { JobCard } from '@/components/JobCard';
import { LoadingState } from '@/components/LoadingState';
import { palette, spacing } from '@/constants/theme';
import { useDailyJobs, useFinalizeDay } from '@/hooks/use-logistics';
import { downloadDailyJobsPdf } from '@/services/downloadDailyPdf';
import { useAuth } from '@/store/auth';
import { formatDisplayDate, todayBusinessDate } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';
import { canCreateJob, canFinalize } from '@/utils/permissions';

export default function DailyJobsScreen() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayBusinessDate());
  const { data, isLoading, isError, refetch, error } = useDailyJobs(date);
  const finalize = useFinalizeDay();
  const [confirm, setConfirm] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const isOpen = data?.status === 'OPEN';
  const isFinalized = data?.status === 'FINALIZED';
  const canAdd = canCreateJob(user?.role) && isOpen;

  const onDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadDailyJobsPdf(date);
      setSnack('PDF ready');
    } catch (err) {
      setSnack(getErrorMessage(err, 'Unable to download the PDF report.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={data?.jobs ?? []}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View style={styles.header}>
            <DateSelector value={date} onChange={setDate} />
            {isLoading ? <LoadingState label="Loading jobs…" /> : null}
            {isError ? (
              <ErrorState
                title="Unable to load jobs for this date."
                message={getErrorMessage(error, 'Please check your connection.')}
                onRetry={() => refetch()}
              />
            ) : null}
            {data ? <DailySummary day={data} /> : null}
            {canFinalize(user?.role) ? (
              <FinalizeButton visible={Boolean(isOpen)} loading={finalize.isPending} onPress={() => setConfirm(true)} />
            ) : null}
            {isFinalized ? (
              <Button
                mode="contained"
                icon="file-pdf-box"
                onPress={onDownloadPdf}
                loading={downloading}
                disabled={downloading}
                buttonColor={palette.navy}
                textColor="#fff"
              >
                Download PDF
              </Button>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => router.push({ pathname: '/(app)/jobs/[id]', params: { id: item._id } })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          !isLoading && !isError ? (
            <EmptyState title="No jobs found." message="You can still create jobs if this day is OPEN." />
          ) : null
        }
      />
      {canAdd ? (
        <FAB
          icon="plus"
          label="Add Job"
          color="#fff"
          style={styles.fab}
          onPress={() => router.push({ pathname: '/(app)/jobs/create', params: { date } })}
        />
      ) : null}
      <ConfirmDialog
        visible={confirm}
        title={`Finalize ${formatDisplayDate(date)}?`}
        message="After finalization, jobs for this date cannot be edited or deleted. This action cannot be undone."
        confirmLabel="Finalize Day"
        loading={finalize.isPending}
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          try {
            await finalize.mutateAsync(date);
            setConfirm(false);
            setSnack('Day Finalized');
          } catch (err) {
            setConfirm(false);
            setSnack(getErrorMessage(err, 'Unable to finalize this day.'));
          }
        }}
      />
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={2500}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surface },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.sm },
  header: { gap: spacing.md, marginBottom: spacing.md },
  fab: { position: 'absolute', right: 16, bottom: 20, backgroundColor: palette.navy },
});
