import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Goal = {
  id: string;
  title: string;
  targetMinutes: number;
  currentMinutes: number;
  deadline: string;
  isCompleted: boolean;
};

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetMinutes: '',
    deadline: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('screenTimeGoals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const saveGoals = async (newGoals: Goal[]) => {
    try {
      await AsyncStorage.setItem('screenTimeGoals', JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetMinutes || !newGoal.deadline) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      targetMinutes: parseInt(newGoal.targetMinutes),
      currentMinutes: 0,
      deadline: newGoal.deadline,
      isCompleted: false,
    };

    saveGoals([...goals, goal]);
    setShowAddModal(false);
    setNewGoal({ title: '', targetMinutes: '', deadline: '' });
  };

  const toggleGoalCompletion = (goalId: string) => {
    const newGoals = goals.map(goal =>
      goal.id === goalId
        ? { ...goal, isCompleted: !goal.isCompleted }
        : goal
    );
    saveGoals(newGoals);
  };

  const deleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newGoals = goals.filter(goal => goal.id !== goalId);
            saveGoals(newGoals);
          },
        },
      ]
    );
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const progress = (item.currentMinutes / item.targetMinutes) * 100;
    const progressColor = progress >= 100 ? '#4CAF50' : '#2196F3';

    return (
      <View style={[styles.goalItem, item.isCompleted && styles.completedGoal]}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteGoal(item.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress, 100)}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.currentMinutes}/{item.targetMinutes} minutes
          </Text>
        </View>

        <View style={styles.goalFooter}>
          <Text style={styles.deadline}>Due: {item.deadline}</Text>
          <TouchableOpacity
            style={[styles.completeButton, item.isCompleted && styles.uncompleteButton]}
            onPress={() => toggleGoalCompletion(item.id)}
          >
            <Text style={styles.completeButtonText}>
              {item.isCompleted ? 'Uncomplete' : 'Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Screen Time Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={item => item.id}
        style={styles.goalList}
      />

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Goal Title"
              value={newGoal.title}
              onChangeText={text => setNewGoal({ ...newGoal, title: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Target Minutes"
              keyboardType="numeric"
              value={newGoal.targetMinutes}
              onChangeText={text => setNewGoal({ ...newGoal, targetMinutes: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Deadline (e.g., 2024-03-31)"
              value={newGoal.deadline}
              onChangeText={text => setNewGoal({ ...newGoal, deadline: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddGoal}
              >
                <Text style={styles.modalButtonText}>Add Goal</Text>
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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#00e676',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  goalList: {
    flex: 1,
  },
  goalItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  completedGoal: {
    opacity: 0.8,
    backgroundColor: '#0d2416',
    borderColor: '#1b4d2e',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    color: '#BBBBBB',
    textAlign: 'right',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  deadline: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  completeButton: {
    backgroundColor: '#00e676',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  uncompleteButton: {
    backgroundColor: '#ff9800',
  },
  completeButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#444444',
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
    backgroundColor: '#ff4d4d',
  },
  saveButton: {
    backgroundColor: '#00e676',
  },
  modalButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Goals;
