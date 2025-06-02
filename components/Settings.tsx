import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type AppLimit = {
  packageName: string;
  appName: string;
  timeLimit: number; // in minutes
  isEnabled: boolean;
};

const Settings = () => {
  const [screenTimeLimit, setScreenTimeLimit] = useState('');
  const [showAppLimitModal, setShowAppLimitModal] = useState(false);
  const [appLimits, setAppLimits] = useState<AppLimit[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppLimit | null>(null);
  const [newTimeLimit, setNewTimeLimit] = useState('');

  useEffect(() => {
    loadAppLimits();
  }, []);

  const loadAppLimits = async () => {
    try {
      const limits = await AsyncStorage.getItem('appLimits');
      if (limits) {
        setAppLimits(JSON.parse(limits));
      }
    } catch (error) {
      console.error('Error loading app limits:', error);
    }
  };

  const saveAppLimits = async (newLimits: AppLimit[]) => {
    try {
      await AsyncStorage.setItem('appLimits', JSON.stringify(newLimits));
      setAppLimits(newLimits);
    } catch (error) {
      console.error('Error saving app limits:', error);
    }
  };

  const handleSaveLimit = () => {
    // Save screen time limit logic
    console.log(`Screen time limit set to: ${screenTimeLimit} minutes`);
  };

  const toggleAppLimit = (app: AppLimit) => {
    const newLimits = appLimits.map(limit =>
      limit.packageName === app.packageName
        ? { ...limit, isEnabled: !limit.isEnabled }
        : limit
    );
    saveAppLimits(newLimits);
  };

  const openAppLimitModal = (app: AppLimit) => {
    setSelectedApp(app);
    setNewTimeLimit(app.timeLimit.toString());
    setShowAppLimitModal(true);
  };

  const saveNewTimeLimit = () => {
    if (!selectedApp || !newTimeLimit) return;

    const timeLimit = parseInt(newTimeLimit);
    if (isNaN(timeLimit) || timeLimit <= 0) {
      Alert.alert('Invalid Time', 'Please enter a valid time limit in minutes.');
      return;
    }

    const newLimits = appLimits.map(limit =>
      limit.packageName === selectedApp.packageName
        ? { ...limit, timeLimit }
        : limit
    );
    saveAppLimits(newLimits);
    setShowAppLimitModal(false);
  };

  const renderAppLimit = ({ item }: { item: AppLimit }) => (
    <View style={styles.appLimitItem}>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.appName}</Text>
        <Text style={styles.timeLimit}>{item.timeLimit} min/day</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openAppLimitModal(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <Switch
          value={item.isEnabled}
          onValueChange={() => toggleAppLimit(item)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={item.isEnabled ? '#2196F3' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Daily Screen Time Limit</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="e.g. 120"
          value={screenTimeLimit}
          onChangeText={setScreenTimeLimit}
        />
        <Text style={styles.inputLabel}>minutes</Text>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveLimit}>
        <Text style={styles.saveButtonText}>Save Limit</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, styles.appLimitTitle]}>
        App Limits
      </Text>
      <FlatList
        data={appLimits}
        renderItem={renderAppLimit}
        keyExtractor={item => item.packageName}
        style={styles.appList}
      />

      <Modal
        visible={showAppLimitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAppLimitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Set Time Limit for {selectedApp?.appName}
            </Text>
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={newTimeLimit}
                onChangeText={setNewTimeLimit}
                placeholder="Enter time limit in minutes"
              />
              <Text style={styles.modalInputLabel}>minutes per day</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAppLimitModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveNewTimeLimit}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  appLimitTitle: {
    marginTop: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appList: {
    marginTop: 10,
  },
  appLimitItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeLimit: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  editButtonText: {
    color: '#2196F3',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  modalInputLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings;
