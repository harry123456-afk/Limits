import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

type SettingRowProps = {
  label: string;
  value?: boolean;
  onToggle?: (val: boolean) => void;
  linkText?: string;
  onPressLink?: () => void;
};

const SettingRow = ({ label, value, onToggle, linkText, onPressLink }: SettingRowProps) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {onToggle !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          thumbColor={value ? '#007AFF' : '#777'}
          trackColor={{ false: '#555', true: '#007AFF' }}
        />
      ) : linkText && onPressLink ? (
        <Pressable onPress={onPressLink}>
          <Text style={styles.link}>{linkText}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#1c1c1c',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 16,
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default SettingRow;
