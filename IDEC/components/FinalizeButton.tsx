import { Button } from 'react-native-paper';

type Props = {
  visible: boolean;
  loading?: boolean;
  onPress: () => void;
};

export function FinalizeButton({ visible, loading, onPress }: Props) {
  if (!visible) return null;
  return (
    <Button mode="contained" buttonColor="#C45C26" onPress={onPress} loading={loading} disabled={loading}>
      Finalize Day
    </Button>
  );
}
