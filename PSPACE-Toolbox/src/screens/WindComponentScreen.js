import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';
import { calculateWindComponent } from '../utils/calculations';

export default function WindComponentScreen({ navigation }) {
  const [runway, setRunway] = useState('');
  const [wind, setWind] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleReset} style={{ marginRight: 15 }}>
          <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>Reset</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleReset = () => {
    setRunway('');
    setWind('');
    setResult(null);
    setError('');
  };

  const handleCalculate = () => {
    Keyboard.dismiss();
    setError('');
    
    if (!runway.trim() || !wind.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Parse wind (format: 120/8)
    const windParts = wind.split('/');
    if (windParts.length !== 2) {
      setError('Wind format should be: direction/speed (e.g., 120/8)');
      return;
    }

    const windDirection = windParts[0];
    const windSpeed = windParts[1];

    const calculated = calculateWindComponent(runway, windDirection, windSpeed);
    setResult({
      ...calculated,
      windDirection,
      windSpeed,
      runway,
    });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
        <InputField
          label="Runway"
          value={runway}
          onChangeText={setRunway}
          placeholder=""
          keyboardType="numeric"
        />
        
        <InputField
          label="Wind (direction/speed)"
          value={wind}
          onChangeText={setWind}
          placeholder=""
        />
        
        <Button 
          title="CALCULATE" 
          onPress={handleCalculate}
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>
                {result.isHeadwind ? 'Headwind' : 'Tailwind'}:
              </Text>
              <Text style={styles.resultValue}>
                {Math.abs(result.headwind)} kts
              </Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Crosswind:</Text>
              <Text style={styles.resultValue}>{result.crosswind} kts</Text>
            </View>

            <View style={styles.diagramContainer}>
              <Text style={styles.diagramLabel}>Runway {result.runway}</Text>
              <View style={styles.diagram}>
                <Text style={styles.runwayLine}>────┼────</Text>
                <Text style={styles.windArrow}>
                  ↗ {result.windDirection}/{result.windSpeed}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  content: {
    padding: 20,
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 20,
  },
  resultBox: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  diagramContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  diagramLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  diagram: {
    alignItems: 'center',
  },
  runwayLine: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: 'monospace',
  },
  windArrow: {
    fontSize: 18,
    color: colors.secondary,
    marginTop: 10,
    fontWeight: 'bold',
  },
});