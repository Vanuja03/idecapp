import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DailySummary } from '@/components/DailySummary';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { palette, spacing } from '@/constants/theme';
import { useDailyJobs, useFinalizeDay } from '@/hooks/use-logistics';
import { useAuth } from '@/store/auth';
import { formatDisplayDate, todayBusinessDate } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';
import { canCreateJob, canFinalize } from '@/utils/permissions';
import { useState } from 'react';

export default function DashboardScreen() {
  const { user } = useAuth();
  const today = todayBusinessDate();
  const { data, isLoading, isError, refetch, error } = useDailyJobs(today);
  const finalize = useFinalizeDay();
  const [confirm, setConfirm] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.hello}>Hello, {user?.name}</Text>
      <Text style={styles.title}>Today's Jobs</Text>
      <Text style={styles.date}>{formatDisplayDate(today)}</Text>

      {isLoading ? <LoadingState label="Loading today's jobs…" /> : null}
      {isError ? (
        <ErrorState
          title="Unable to load today's jobs."
          message={getErrorMessage(error, 'Please check your connection.')}
          onRetry={() => refetch()}
        />
      ) : null}
      {data ? <DailySummary day={data} /> : null}

      <View style={styles.actions}>
        {canCreateJob(user?.role) && data?.status === 'OPEN' ? (
          <Button mode="contained" onPress={() => router.push({ pathname: '/(app)/jobs/create', params: { date: today } })}>
            + Create Job
          </Button>
        ) : null}
        <Button mode="outlined" onPress={() => router.push('/(app)/(tabs)/jobs')}>
          View Today's Jobs
        </Button>
        {canFinalize(user?.role) && data?.status === 'OPEN' ? (
          <Button mode="contained" buttonColor={palette.accent} onPress={() => setConfirm(true)}>
            Finalize Today
          </Button>
        ) : null}
      </View>

      <ConfirmDialog
        visible={confirm}
        title={`Finalize ${formatDisplayDate(today)}?`}
        message="After finalization, jobs for this date cannot be edited or deleted. This action cannot be undone."
        confirmLabel="Finalize Day"
        loading={finalize.isPending}
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          try {
            await finalize.mutateAsync(today);
            setConfirm(false);
          } catch {
            setConfirm(false);
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, backgroundColor: palette.surface, flexGrow: 1 },
  hello: { color: palette.muted },
  title: { fontSize: 26, fontWeight: '800', color: palette.navy },
  date: { color: palette.steel, fontWeight: '600' },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
