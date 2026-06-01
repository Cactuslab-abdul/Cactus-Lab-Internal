import { useEffect, useState, useCallback } from 'react';

// Re-run `loader` whenever the user comes back to the tab AND whenever the
// caller bumps the manual trigger. Gives the dual-view portal a basic
// "in-sync" feel without sockets/polling overhead.
export function useRefreshOnFocus(loader: () => void | Promise<void>) {
  useEffect(() => {
    const onFocus = () => { void loader(); };
    const onVisibility = () => { if (document.visibilityState === 'visible') void loader(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loader]);
}

export function useManualRefresh() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);
  return { tick, refresh };
}
