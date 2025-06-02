import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

export type AppUsageData = {
  appName: string;
  timeUsed: number; // in minutes
};

type AppUsageChartProps = {
  data: AppUsageData[];
};

export const AppUsageChart: React.FC<AppUsageChartProps> = ({ data }) => {
  const screenWidth = Dimensions.get('window').width;

  const chartData = {
    labels: data.map(item => item.appName),
    datasets: [
      {
        data: data.map(item => item.timeUsed),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#111',
    backgroundGradientFrom: '#111',
    backgroundGradientTo: '#111',
    color: (opacity = 1) => `rgba(0, 230, 118, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Usage Statistics</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix="m"
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars
        fromZero
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: '#222',
    borderRadius: 15,
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
}); 