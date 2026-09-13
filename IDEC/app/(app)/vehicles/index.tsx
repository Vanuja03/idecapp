import { Redirect } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Portal, Switch, TextInput } from 'react-native-paper';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { palette, radius, spacing } from '@/constants/theme';
import { useCreateVehicle, useSetVehicleStatus, useUpdateVehicle, useVehicles } from '@/hooks/use-logistics';
import { useAuth } from '@/store/auth';
import { Vehicle } from '@/types';
import { getErrorMessage } from '@/utils/errors';
import { canManageVehicles, canViewVehiclesScreen } from '@/utils/permissions';

export default function VehiclesScreen() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, error } = useVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const setStatus = useSetVehicleStatus();
  const [editor, setEditor] = useState<Partial<Vehicle> | 'new' | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const canManage = canManageVehicles(user?.role);

  if (!canViewVehiclesScreen(user?.role)) {
    return <Redirect href="/(app)/(tabs)/profile" />;
  }

  const openNew = () => {
    setEditor('new');
    setVehicleNumber('');
    setDescription('');
    setFormError(null);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditor(vehicle);
    setVehicleNumber(vehicle.vehicleNumber);
    setDescription(vehicle.description);
    setFormError(null);
  };

  const save = async () => {
    try {
      if (editor === 'new') {
        await createVehicle.mutateAsync({ vehicleNumber, description });
      } else if (editor && editor._id) {
        await updateVehicle.mutateAsync({
          id: editor._id,
          payload: { vehicleNumber, description },
        });
      }
      setEditor(null);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to save vehicle.'));
    }
  };

  return (
    <View style={styles.screen}>
      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <ErrorState title="Unable to load vehicles." message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : null}
      <FlatList
        contentContainerStyle={styles.content}
        data={data ?? []}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={!isLoading ? <EmptyState title="No vehicles yet." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.number}>{item.vehicleNumber}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.status}>{item.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
            <View style={styles.actions}>
              {canManage ? (
                <>
                  <Button compact onPress={() => openEdit(item)}>
                    Edit
                  </Button>
                  <Switch
                    value={item.isActive}
                    onValueChange={(value) => setStatus.mutate({ id: item._id, isActive: value })}
                  />
                </>
              ) : null}
            </View>
          </View>
        )}
      />
      {canManage ? (
        <Button mode="contained" style={styles.add} onPress={openNew}>
          Add vehicle
        </Button>
      ) : null}
      <Portal>
        <Dialog visible={Boolean(editor)} onDismiss={() => setEditor(null)}>
          <Dialog.Title>{editor === 'new' ? 'Add vehicle' : 'Edit vehicle'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Vehicle number" value={vehicleNumber} onChangeText={setVehicleNumber} autoCapitalize="characters" />
            <TextInput label="Description" value={description} onChangeText={setDescription} style={{ marginTop: 12 }} />
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditor(null)}>Cancel</Button>
            <Button onPress={save}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surface },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 100 },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  number: { fontWeight: '800', fontSize: 18, color: palette.text },
  desc: { color: palette.muted },
  status: { marginTop: 4, fontWeight: '700', color: palette.steel },
  actions: { alignItems: 'flex-end' },
  add: { margin: spacing.lg },
  error: { color: palette.error, marginTop: 8 },
});
