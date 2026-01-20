import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';

export default function AirSpeedsScreen({ navigation }) {
  const [ias, setIas] = useState('');
  const [altitude, setAltitude] = useState('');
  const [temperature, setTemperature] = useState('');
  const [result, setResult] = useState(null);

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
    setIas('');
    setAltitude('');
    setTemperature('');
    setResult(null);
  };

  const handleCalculate = () => {
    Keyboard.dismiss();
    if (!ias || !altitude) {
      return;
    }

    const iasValue = parseFloat(ias);
    const alt = parseFloat(altitude);
    const temp = temperature ? parseFloat(temperature) : 15; // ISA standard

    // CAS ≈ IAS (simplified, ignoring instrument/position error)
    const cas = iasValue;

    // TAS calculation using simplified formula
    // TAS = CAS * (1 + (altitude / 1000) * 0.02)
    const tas = cas * (1 + (alt / 1000) * 0.02);

    // Mach number calculation (simplified)
    // Speed of sound at sea level ISA: 661.47 knots
    // Decreases with altitude
    const speedOfSound = 661.47 * Math.sqrt((temp + 273.15) / 288.15);
    const mach = tas / speedOfSound;

    setResult({
      ias: iasValue.toFixed(0),
      cas: cas.toFixed(0),
      tas: tas.toFixed(0),
      mach: mach.toFixed(3),
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
        <Text style={styles.description}>
          Calculate various airspeeds (IAS, CAS, TAS, Mach)
        </Text>

        <InputField
          label="IAS (Indicated Airspeed) - kts"
          value={ias}
          onChangeText={setIas}
          placeholder=""
          keyboardType="numeric"
        />

        <InputField
          label="Altitude - feet"
          value={altitude}
          onChangeText={setAltitude}
          placeholder=""
          keyboardType="numeric"
        />

        <InputField
          label="Temperature - °C (optional, default ISA)"
          value={temperature}
          onChangeText={setTemperature}
          placeholder=""
          keyboardType="numeric"
        />

        <Button 
          title="CALCULATE" 
          onPress={handleCalculate}
        />

        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>IAS (Indicated):</Text>
              <Text style={styles.resultValue}>{result.ias} kts</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>CAS (Calibrated):</Text>
              <Text style={styles.resultValue}>{result.cas} kts</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>TAS (True):</Text>
              <Text style={styles.resultValue}>{result.tas} kts</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Mach Number:</Text>
              <Text style={styles.resultValue}>{result.mach}</Text>
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
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    fontStyle: 'italic',
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
});