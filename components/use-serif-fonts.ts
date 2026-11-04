import { Fraunces_600SemiBold, Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';

const serifFallback = process.env.EXPO_OS === 'android' ? 'serif' : 'Georgia';

export function useSerifFonts() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  return {
    serifSemi: fontsLoaded ? 'Fraunces_600SemiBold' : serifFallback,
    serifBold: fontsLoaded ? 'Fraunces_700Bold' : serifFallback,
  };
}
