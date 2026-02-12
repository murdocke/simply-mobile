import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { MetronomeProvider } from '@/components/metronome/metronome-provider';
import { AppThemeProvider, useAppTheme } from '@/components/theme/app-theme-provider';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <MetronomeProvider>
        <RootNavigator />
      </MetronomeProvider>
    </AppThemeProvider>
  );
}

function RootNavigator() {
  const { mode } = useAppTheme();
  const colorScheme = mode;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="teachers" options={{ headerShown: false }} />
        <Stack.Screen name="students" options={{ headerShown: false }} />
        <Stack.Screen name="schedule" options={{ headerShown: false }} />
        <Stack.Screen name="curriculum" options={{ headerShown: false }} />
        <Stack.Screen name="current-lesson" options={{ headerShown: false }} />
        <Stack.Screen name="metronome" options={{ headerShown: false }} />
        <Stack.Screen name="coaching" options={{ headerShown: false }} />
        <Stack.Screen name="library" options={{ headerShown: false }} />
        <Stack.Screen name="simpedia" options={{ headerShown: false }} />
        <Stack.Screen name="store" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
