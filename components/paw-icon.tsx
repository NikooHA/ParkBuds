import Svg, { Ellipse } from 'react-native-svg';

type PawIconProps = {
  size?: number;
  color?: string;
};

export function PawIcon({ size = 24, color = '#FFFFFF' }: PawIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Ellipse cx="7.1" cy="8.4" rx="2" ry="2.5" fill={color} />
      <Ellipse cx="11.2" cy="6.3" rx="2.05" ry="2.65" fill={color} />
      <Ellipse cx="15.4" cy="7.2" rx="1.95" ry="2.45" fill={color} />
      <Ellipse cx="18.1" cy="10.7" rx="1.8" ry="2.2" fill={color} />
      <Ellipse cx="12.1" cy="15.7" rx="4.6" ry="3.55" fill={color} />
    </Svg>
  );
}
