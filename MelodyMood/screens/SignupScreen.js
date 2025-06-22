import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({ switchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    await AsyncStorage.setItem('userData', JSON.stringify({ email, password }));
    switchToLogin(); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Sign Up" onPress={handleSignup} />
      <TouchableOpacity onPress={switchToLogin}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
  error: { color: 'red', textAlign: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  link: { color: '#1DB954', marginTop: 15, textAlign: 'center' },
});
