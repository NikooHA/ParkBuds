import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

type GoatCounter = { count?: (vars: { path: string }) => void };

// GoatCounter (loaded in public/index.html) counts the first page load on its own.
// The site switches screens without reloading, so count later screen changes here.
export function usePageViews() {
  const pathname = usePathname();
  const firstPath = useRef<string | null>(null);

  useEffect(() => {
    if (process.env.EXPO_OS !== 'web') return;
    if (firstPath.current === null) {
      firstPath.current = pathname;
      return;
    }
    const goatcounter = (globalThis as { goatcounter?: GoatCounter }).goatcounter;
    goatcounter?.count?.({ path: pathname });
  }, [pathname]);
}
