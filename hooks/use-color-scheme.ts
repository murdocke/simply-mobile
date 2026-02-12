import { useAppTheme } from '@/components/theme/app-theme-provider';

export function useColorScheme() {
  const { mode } = useAppTheme();
  return mode;
}
