import React from 'react';
import { View, Text, Button } from 'react-native';

const HomePage = ({ navigation }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Welcome to the Home Page!</Text>
    <Button 
      title="Go to Settings" 
      onPress={() => navigation.navigate('Settings')} 
    />
  </View>
);

export default HomePage;
