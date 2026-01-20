import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';

export default function AltitudesHeightsScreen({ navigation }) {
  const [indicatedAlt, setIndicatedAlt] = useState('');
  const [qnh, setQnh] = useState('');
  const [temperature, setTemperature] = useState('');
  const [elevation, setElevation] = useState('');
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
    setIndicatedAlt('');
    setQnh('');
    setTemperature('');
    setElevation('');
    setResult(null);
  };

  const handleCalculate = () => {
    Keyboard.dismiss();
    if (!indicatedAlt || !qnh) {
      return;
    }

    const altValue = parseFloat(indicatedAlt);
    const qnhValue = parseFloat(qnh);
    const temp = temperature ? parseFloat(temperature) : 15; // ISA standard
    const elev = elevation ? parseFloat(elevation) : 0;

    // Pressure altitude = Indicated altitude + (1013 - QNH) * 30
    const pressureAlt = altValue + ((1013 - qnhValue) * 30);

    // ISA temperature at altitude
    const isaTemp = 15 - (pressureAlt / 1000 * 2); // 2°C per 1000ft

    // Density altitude calculation
    const densityAlt = pressureAlt + (120 * (temp - isaTemp));

    // Height above ground
    const heightAGL = altValue - elev;

    setResult({
      indicated: altValue.toFixed(0),
      pressure: pressureAlt.toFixed(0),
      density: densityAlt.toFixed(0),
      heightAGL: heightAGL.toFixed(0),
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
          Calculate pressure altitude, density altitude, and height AGL
        </Text>

        <InputField
          label="Indicated Altitude - feet"
          value={indicatedAlt}
          onChangeText={setIndicatedAlt}
          placeholder=""
          keyboardType="numeric"
        />

        <InputField
          label="QNH - hPa"
          value={qnh}
          onChangeText={setQnh}
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

        <InputField
          label="Field Elevation - feet (optional)"
          value={elevation}
          onChangeText={setElevation}
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
              <Text style={styles.resultLabel}>Indicated Altitude:</Text>
              <Text style={styles.resultValue}>{result.indicated} ft</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Pressure Altitude:</Text>
              <Text style={styles.resultValue}>{result.pressure} ft</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Density Altitude:</Text>
              <Text style={styles.resultValue}>{result.density} ft</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Height AGL:</Text>
              <Text style={styles.resultValue}>{result.heightAGL} ft</Text>
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