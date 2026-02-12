import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { armLeftMenuNudgeForNextShell } from '@/components/navigation/menu-nudge-session';

const accounts = {
  neil: { password: '123456', label: 'Company account' },
  brian: { password: '123456', label: 'Teacher account' },
  quinn: { password: '123456', label: 'Student account' },
} as const;

export default function LoginScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const normalizedUsername = useMemo(() => username.trim().toLowerCase(), [username]);
  const demoAccounts = useMemo(
    () =>
      Object.entries(accounts).map(([key, value]) => ({
        username: key,
        role: value.label.replace(' account', ''),
      })),
    []
  );

  const handleSignIn = (nextUser?: string, nextPassword?: string) => {
    const nextNormalized = (nextUser ?? normalizedUsername).trim().toLowerCase();
    const pass = nextPassword ?? password;
    const account = accounts[nextNormalized as keyof typeof accounts];

    if (!account || account.password !== pass) {
      setError('Invalid username or password.');
      setShowDemo(true);
      return;
    }

    setError('');
    armLeftMenuNudgeForNextShell();
    router.replace({
      pathname: '/dashboard',
      params: { user: nextNormalized },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <View style={styles.card}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>SM</Text>
            </View>
            <View>
              <Text style={styles.brandOverline}>ADMIN</Text>
              <Text style={styles.brandTitle}>Simply Music</Text>
            </View>
          </View>

          <View style={styles.form}>
            <TextInput
              placeholder="Username"
              placeholderTextColor={palette.textMuted}
              autoCapitalize="none"
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                if (error) setError('');
              }}
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (error) setError('');
              }}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSignIn}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setShowDemo((current) => {
                const next = !current;
                if (!next) {
                  setError('');
                  setUsername('');
                  setPassword('');
                }
                return next;
              })
            }
            style={({ pressed }) => [styles.demoToggle, pressed && styles.demoTogglePressed]}>
            <Text style={styles.demoToggleText}>Demo Accounts</Text>
          </Pressable>

          {showDemo ? (
            <View style={styles.demoCard}>
              <View style={styles.demoHeader}>
                <Text style={styles.demoTitle}>Available Logins</Text>
                <Text style={styles.demoPill}>Password: 123456</Text>
              </View>
              {demoAccounts.map((account) => (
                <Pressable
                  key={account.username}
                  onPress={() => {
                    setUsername(account.username);
                    setPassword('123456');
                    setError('');
                    handleSignIn(account.username, '123456');
                  }}
                  style={({ pressed }) => [styles.demoRow, pressed && styles.demoRowPressed]}>
                  <Text style={styles.demoUsername}>{account.username}</Text>
                  <Text style={styles.demoRole}>{account.role}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: palette.surface,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  logoBadge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandOverline: {
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 3,
  },
  brandTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  form: {
    gap: 12,
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 12 }),
    fontSize: 15,
    color: palette.text,
  },
  errorText: {
    color: palette.danger,
    marginBottom: 14,
  },
  button: {
    backgroundColor: palette.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: palette.primaryPressed,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  demoToggle: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    alignItems: 'center',
    paddingVertical: 11,
  },
  demoTogglePressed: {
    opacity: 0.86,
  },
  demoToggleText: {
    color: palette.textMuted,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  demoCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    overflow: 'hidden',
  },
  demoHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  demoTitle: {
    color: palette.text,
    fontWeight: '600',
    fontSize: 14,
  },
  demoPill: {
    color: palette.textMuted,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
  },
  demoRow: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoRowPressed: {
    backgroundColor: palette.surface,
  },
  demoUsername: {
    color: palette.text,
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'lowercase',
  },
  demoRole: {
    color: palette.textMuted,
    fontSize: 13,
    textTransform: 'capitalize',
  },
});
