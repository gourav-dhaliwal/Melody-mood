import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ switchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    const stored = await AsyncStorage.getItem('userData');
    const userData = JSON.parse(stored);

    if (userData && userData.email === email && userData.password === password) {
      login(userData);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bg.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Dark overlay for readability */}
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>Login to MelodyMood</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ddd"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          textContentType="emailAddress"
          autoComplete="email"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#ddd"
          style={styles.input}
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          textContentType="password"
          autoComplete="password"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>

        <TouchableOpacity onPress={switchToSignup}>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    zIndex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Helvetica',
  },
  input: {
  backgroundColor: '#fff',   
  borderRadius: 8,
  padding: 12,
  marginVertical: 10,
  color: 'black',          
  fontSize: 16,
},

  
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#1DB954',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
