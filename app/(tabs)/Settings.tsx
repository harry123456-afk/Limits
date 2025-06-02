// app/(tabs)/Settings.tsx
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import SettingRow from '../../components/SettingRow';

const Settings = () => {
  const [remindersOn, setRemindersOn] = useState(true);
  const [darkModeOn, setDarkModeOn] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <SettingRow
        label="Daily Reminders"
        value={remindersOn}
        onToggle={setRemindersOn}
      />

      <SettingRow
        label="Dark Mode"
        value={darkModeOn}
        onToggle={setDarkModeOn}
      />

      <SettingRow
        label="Usage Insights"
        linkText="View"
        onPressLink={() => Alert.alert('Coming soon!')}
      />

      <SettingRow
        label="Reset Daily Limit"
        linkText="Reset"
        onPressLink={() => Alert.alert('Limit reset!')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
});

export default Settings;
