import { useCallback, useState } from 'react';
import { palette } from '@/constants/theme';

/** Props for a `RefreshControl`; the spinner only shows for a user pull, not background refetches. */
export function usePullToRefresh(refresh: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return { refreshing, onRefresh, colors: [palette.navy], tintColor: palette.navy };
}
