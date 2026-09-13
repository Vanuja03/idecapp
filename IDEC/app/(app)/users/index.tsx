import { Redirect } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Portal, Switch, TextInput } from 'react-native-paper';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { palette, radius, spacing } from '@/constants/theme';
import { useCreateUser, useSetUserStatus, useUpdateUser, useUsers } from '@/hooks/use-logistics';
import { useAuth } from '@/store/auth';
import { AuthUser, UserRole } from '@/types';
import { getErrorMessage } from '@/utils/errors';
import { canManageUsers } from '@/utils/permissions';

const roles: UserRole[] = ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'];

export default function UsersScreen() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, error } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const setStatus = useSetUserStatus();
  const [editor, setEditor] = useState<'new' | AuthUser | null>(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.OPERATOR);
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!canManageUsers(user?.role)) {
    return <Redirect href="/(app)/(tabs)/profile" />;
  }

  const openNew = () => {
    setEditor('new');
    setUsername('');
    setName('');
    setRole(UserRole.OPERATOR);
    setPassword('');
    setFormError(null);
  };

  const openEdit = (item: AuthUser) => {
    setEditor(item);
    setUsername(item.username);
    setName(item.name);
    setRole(item.role);
    setPassword('');
    setFormError(null);
  };

  const save = async () => {
    try {
      if (editor === 'new') {
        await createUser.mutateAsync({ username, name, role, password });
      } else if (editor) {
        await updateUser.mutateAsync({
          id: editor.id,
          payload: { name, role, ...(password ? { password } : {}) },
        });
      }
      setEditor(null);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to save user.'));
    }
  };

  return (
    <View style={styles.screen}>
      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <ErrorState title="Unable to load users." message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : null}
      <FlatList
        contentContainerStyle={styles.content}
        data={data ?? []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!isLoading ? <EmptyState title="No users found." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>@{item.username}</Text>
              <Text style={styles.role}>{item.role}</Text>
            </View>
            <View style={styles.actions}>
              <Button compact onPress={() => openEdit(item)}>
                Edit
              </Button>
              <Switch
                value={item.isActive !== false}
                onValueChange={(value) => setStatus.mutate({ id: item.id, isActive: value })}
              />
            </View>
          </View>
        )}
      />
      <Button mode="contained" style={styles.add} onPress={openNew}>
        Create user
      </Button>
      <Portal>
        <Dialog visible={Boolean(editor)} onDismiss={() => setEditor(null)}>
          <Dialog.Title>{editor === 'new' ? 'Create user' : 'Edit user'}</Dialog.Title>
          <Dialog.Content>
            {editor === 'new' ? (
              <TextInput label="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
            ) : (
              <Text style={styles.meta}>@{username}</Text>
            )}
            <TextInput label="Name" value={name} onChangeText={setName} style={{ marginTop: 12 }} />
            <View style={styles.roles}>
              {roles.map((item) => (
                <Button key={item} compact mode={role === item ? 'contained' : 'outlined'} onPress={() => setRole(item)}>
                  {item}
                </Button>
              ))}
            </View>
            <TextInput
              label={editor === 'new' ? 'Password' : 'Reset password (optional)'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={{ marginTop: 12 }}
            />
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
  },
  name: { fontWeight: '800', fontSize: 16, color: palette.text },
  meta: { color: palette.muted },
  role: { fontWeight: '700', color: palette.navy, marginTop: 4 },
  actions: { alignItems: 'flex-end' },
  add: { margin: spacing.lg },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  error: { color: palette.error, marginTop: 8 },
});
