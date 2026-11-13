import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../components/theme';
import { usePageViews } from '../components/use-page-views';
import { VisitProvider } from '../components/visit-store';

export default function RootLayout() {
  usePageViews();

  return (
    <VisitProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </VisitProvider>
  );
}
