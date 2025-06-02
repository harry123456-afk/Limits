import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

// Map screen names to Ionicons icon names
const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  Dashboard: 'stats-chart',
  Settings: 'options',
  Goals: 'flag',
};

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor: '#007AFF', // iOS-style blue
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'black', // Black tab bar
          borderTopWidth: 0,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: 'black',
          elevation: 0,       // Remove shadow on Android
          shadowOpacity: 0,   // Remove shadow on iOS
          height: 56,         // Reduce header height for less space
          paddingTop: 0,
          marginTop: 0,
        },
        headerTitleStyle: {
          marginTop: 0,
          paddingTop: 0,
          lineHeight: 24,
          fontWeight: '600',
          color: 'white',
        },
      })}
    >
      <Tabs.Screen name="Dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="Settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="Goals" options={{ title: 'Goals' }} />
    </Tabs>
  );
}
