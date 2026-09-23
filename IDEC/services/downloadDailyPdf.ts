import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { api } from '@/api/client';

export async function downloadDailyJobsPdf(date: string): Promise<void> {
  const response = await api.get<ArrayBuffer>(`/daily-jobs/${date}/pdf`, {
    responseType: 'arraybuffer',
    timeout: 60000,
  });

  const fileName = `daily-jobs-${date}.pdf`;
  const bytes = new Uint8Array(response.data);

  if (Platform.OS === 'web') {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, fileName);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(bytes);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Daily jobs ${date}`,
    UTI: 'com.adobe.pdf',
  });
}
