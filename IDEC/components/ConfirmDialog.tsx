import { Dialog, Portal, Button, Text } from 'react-native-paper';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  loading,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onPress={onConfirm} loading={loading} disabled={loading}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
