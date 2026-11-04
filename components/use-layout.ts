import { useWindowDimensions } from 'react-native';

// Phone proportions come from a 390×844 screen. A wide browser uses its own layout at this size.
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;
const WIDE_WEB_MIN = 720;

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const wideWeb = process.env.EXPO_OS === 'web' && width >= WIDE_WEB_MIN;
  const widthScale = wideWeb ? 1 : width / BASE_WIDTH;
  const heightScale = wideWeb ? 1 : height / BASE_HEIGHT;

  return {
    width,
    height,
    wideWeb,
    w: (size: number) => size * widthScale,
    h: (size: number) => size * heightScale,
  };
}
