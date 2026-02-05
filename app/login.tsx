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

const palette = {
  background: '#f6f4f1',
  card: '#ffffff',
  border: '#e6e0da',
  text: '#2a2a2a',
  muted: '#8b8782',
  primary: '#c8102e',
  primaryDark: '#a40d25',
  error: '#b8322d',
};

const accounts = {
  neil: { password: '123456', label: 'Company account' },
  brian: { password: '123456', label: 'Teacher account' },
  quinn: { password: '123456', label: 'Student account' },
} as const;

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const normalizedUsername = useMemo(() => username.trim().toLowerCase(), [username]);

  const handleSignIn = () => {
    const account = accounts[normalizedUsername as keyof typeof accounts];

    if (!account || account.password !== password) {
      setError('Invalid username or password.');
      return;
    }

    setError('');
    router.replace({
      pathname: '/dashboard',
      params: { user: normalizedUsername },
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
              placeholderTextColor={palette.muted}
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
              placeholderTextColor={palette.muted}
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: palette.card,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
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
    color: palette.muted,
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
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 12 }),
    fontSize: 15,
    color: palette.text,
  },
  errorText: {
    color: palette.error,
    marginBottom: 14,
  },
  button: {
    backgroundColor: palette.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: palette.primaryDark,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
