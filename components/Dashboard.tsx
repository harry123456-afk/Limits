import { AppUsageChart, AppUsageData } from '@components/AppUsageChart';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  LayoutAnimation,
  Modal,
  NativeEventSubscription,
  NativeModules,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

interface SessionData {
  start: Date;
  end: Date;
  duration: number;
}

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MOTIVATIONAL_QUOTES = [
  "Keep going! You've got this 💪",
  "Believe in yourself and all that you are!",
  "Every step counts—keep moving forward!",
  "Stay positive, work hard, make it happen!",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else will!",
  "Great things never come from comfort zones.",
] as const;

const Dashboard: React.FC = () => {
  const [secondsUsed, setSecondsUsed] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(60 * 60); // default 60 min
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [breakTimeLogged, setBreakTimeLogged] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showMotivation, setShowMotivation] = useState<boolean>(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  const [motivationQuote, setMotivationQuote] = useState<string>('');
  const [historyExpanded, setHistoryExpanded] = useState<boolean>(false);
  const [prevSecondsUsed, setPrevSecondsUsed] = useState<number>(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backHandlerRef = useRef<NativeEventSubscription | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get('window').width;
  const circleSize = screenWidth * 0.6;

  // Mock app usage data - in a real app, this would be fetched from a backend
  const [appUsageData, setAppUsageData] = useState<AppUsageData[]>([
    { appName: 'Instagram', timeUsed: 45 },
    { appName: 'Twitter', timeUsed: 30 },
    { appName: 'YouTube', timeUsed: 60 },
    { appName: 'TikTok', timeUsed: 25 },
    { appName: 'WhatsApp', timeUsed: 15 },
  ]);

  // Simulating data update from backend every 5 minutes
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setAppUsageData(prevData =>
        prevData.map(app => ({
          ...app,
          timeUsed: Math.floor(app.timeUsed * (1 + Math.random() * 0.2)),
        }))
      );
    }, 5 * 60 * 1000);

    return () => clearInterval(updateInterval);
  }, []);

  // Timer increment
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsUsed(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (notificationIntervalRef.current) clearInterval(notificationIntervalRef.current);
    };
  }, [isRunning]);

  // Animate circular progress
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(secondsUsed / dailyLimit, 1),
      duration: 500,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [secondsUsed, dailyLimit, progressAnim]);

  // Show popup when limit reached
  useEffect(() => {
    if (secondsUsed >= dailyLimit && !showPopup) {
      setShowPopup(true);
      setIsRunning(false);
    }
  }, [secondsUsed, dailyLimit, showPopup]);

  // Pick random motivational quote
  useEffect(() => {
    if (showMotivation) {
      const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
      setMotivationQuote(MOTIVATIONAL_QUOTES[idx]);
    }
  }, [showMotivation]);

  // Handle Android back button
  useEffect(() => {
    backHandlerRef.current = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (showPopup) {
          setShowPopup(false);
          setIsRunning(false);
          if (notificationIntervalRef.current) {
            clearInterval(notificationIntervalRef.current);
          }
          return true;
        }
        return false;
      }
    );

    return () => {
      backHandlerRef.current?.remove();
    };
  }, [showPopup]);

  const handleStart = () => {
    setIsRunning(true);
    setShowMotivation(false);
    setSessionStart(new Date());
  };

  const handleStop = () => {
    setIsRunning(false);
    setShowMotivation(true);
    setPrevSecondsUsed(secondsUsed);
    if (sessionStart) {
      const end = new Date();
      const duration = Math.floor((end.getTime() - sessionStart.getTime()) / 1000);
      setSessionHistory(prev => [...prev, { start: sessionStart, end, duration }]);
      setSessionStart(null);
    }
  };

  const handleRespawn = () => {
    setSecondsUsed(prevSecondsUsed);
    setShowMotivation(false);
    setBreakTimeLogged(false);
    setIsRunning(true);
    setSessionStart(new Date());
  };

  const handleQuit = () => {
    setSecondsUsed(0);
    setPrevSecondsUsed(0);
    setShowMotivation(false);
    setBreakTimeLogged(false);
    setIsRunning(false);
    setSessionStart(null);
  };

  const handleContinueUsing = () => {
    setShowPopup(false);
    setIsRunning(true);
    notificationIntervalRef.current = setInterval(() => {
      NativeModules.OverlayService?.showScreenTimeReminder();
    }, 10 * 60 * 1000);
  };

  const handleTakeBreak = () => {
    setShowPopup(false);
    setBreakTimeLogged(true);
    setSecondsUsed(0);
    setIsRunning(false);
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
  };

  const setLimit = (minutes: number) => {
    setDailyLimit(minutes * 60);
    setSecondsUsed(0);
    setBreakTimeLogged(false);
    setShowPopup(false);
    setIsRunning(false);
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
  };

  const formatTime = (secs: number): string => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  const circleProgress = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Toggle session history with smooth animation
  const toggleHistory = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHistoryExpanded(!historyExpanded);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Circular Progress Timer */}
        <View style={[styles.circleContainer, { width: circleSize, height: circleSize }]}>
          <View
            style={[
              styles.circleBackground,
              { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
            ]}
          />
          <Animated.View
            style={[
              styles.circleProgress,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                transform: [{ rotate: circleProgress }],
              },
            ]}
          />
          <View
            style={[
              styles.centerCircle,
              {
                width: circleSize * 0.7,
                height: circleSize * 0.7,
                borderRadius: (circleSize * 0.7) / 2,
              },
            ]}
          >
            <Text style={styles.time}>{formatTime(secondsUsed)}</Text>
            <Text style={styles.timerLabel}>Screen Time Used</Text>
          </View>
        </View>

        <Text style={styles.note}>Daily limit: {formatTime(dailyLimit)}</Text>

        {breakTimeLogged && <Text style={styles.breakNote}>Break time logged! Great job 👍</Text>}

        <Text style={styles.selectLimitText}>Select your daily screen time limit:</Text>
        <View style={styles.limitButtonRow}>
          {[15, 30, 60, 120].map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.limitButton,
                dailyLimit === minutes * 60 && styles.limitButtonSelected,
              ]}
              onPress={() => setLimit(minutes)}
            >
              <Text
                style={[
                  styles.limitButtonText,
                  dailyLimit === minutes * 60 && styles.limitButtonTextSelected,
                ]}
              >
                {minutes} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#28a745' }]}
            onPress={handleStart}
            disabled={isRunning}
          >
            <Text style={styles.controlButtonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#dc3545' }]}
            onPress={handleStop}
            disabled={!isRunning}
          >
            <Text style={styles.controlButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>

        {/* App Usage Chart */}
        <AppUsageChart data={appUsageData} />

        {/* Session History */}
        <TouchableOpacity onPress={toggleHistory} style={styles.historyToggle}>
          <Text style={styles.historyToggleText}>
            {historyExpanded ? 'Hide' : 'Show'} Session History ({sessionHistory.length})
          </Text>
        </TouchableOpacity>
        {historyExpanded && (
          <ScrollView style={styles.historyContainer}>
            {sessionHistory.map((session, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyText}>
                  {session.start.toLocaleTimeString()} - {session.end.toLocaleTimeString()} | Duration: {formatTime(session.duration)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Popup Notification */}
        <Modal visible={showPopup} transparent animationType="fade">
          <View style={styles.popupOverlay}>
            <View style={styles.popup}>
              <Text style={styles.popupText}>You've reached your daily screen time limit!</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.popupButton, { backgroundColor: '#d9534f' }]}
                  onPress={handleTakeBreak}
                >
                  <Text style={styles.popupButtonText}>Take a break</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.popupButton, { backgroundColor: '#f0ad4e' }]}
                  onPress={handleContinueUsing}
                >
                  <Text style={styles.popupButtonText}>Continue using</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Motivational Overlay */}
        <Modal visible={showMotivation} transparent animationType="fade">
          <View style={styles.motivationOverlay}>
            <View style={styles.motivationBox}>
              <Text style={styles.motivationQuote}>{motivationQuote}</Text>
              <View style={styles.motivationButtons}>
                <TouchableOpacity style={styles.respawnButton} onPress={handleRespawn}>
                  <Text style={styles.respawnButtonText}>Respawn</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.respawnButton, { backgroundColor: '#d9534f' }]}
                  onPress={handleQuit}
                >
                  <Text style={[styles.respawnButtonText, { color: '#fff' }]}>Quit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  circleBackground: {
    position: 'absolute',
    borderWidth: 15,
    borderColor: '#444',
    backgroundColor: 'transparent',
  },
  circleProgress: {
    position: 'absolute',
    borderWidth: 15,
    borderColor: '#00ff00',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  centerCircle: {
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00e676',
  },
  timerLabel: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  note: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
  },
  breakNote: {
    color: '#0f0',
    fontSize: 14,
    marginBottom: 10,
  },
  selectLimitText: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 8,
  },
  limitButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  limitButton: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  limitButtonSelected: {
    backgroundColor: '#00e676',
    borderColor: '#00c853',
  },
  limitButtonText: {
    color: '#aaa',
    fontSize: 14,
  },
  limitButtonTextSelected: {
    color: '#111',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyToggle: {
    marginBottom: 8,
  },
  historyToggleText: {
    color: '#00e676',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  historyContainer: {
    maxHeight: 150,
    width: '90%',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  historyItem: {
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  historyText: {
    color: '#aaa',
    fontSize: 13,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '85%',
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 20,
  },
  popupText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  popupButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  motivationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  motivationBox: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    alignItems: 'center',
  },
  motivationQuote: {
    color: '#00e676',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  motivationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  respawnButton: {
    backgroundColor: '#00e676',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  respawnButtonText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Dashboard;
