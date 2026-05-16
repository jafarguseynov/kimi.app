import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, secureTextEntry, style, ...props }: InputProps) {
  const [secure, setSecure] = useState(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, error ? styles.errorBorder : styles.normalBorder]}>
        <TextInput
          style={[styles.input, style]}
          secureTextEntry={secure}
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eye}>
            <Text style={{ fontSize: 16 }}>{secure ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 6 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
  },
  normalBorder: { borderColor: Colors.border },
  errorBorder: { borderColor: Colors.danger },
  input: { flex: 1, height: 48, fontSize: 16, color: Colors.textPrimary },
  eye: { padding: 4 },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4 },
});
