import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';

export default function AltitudesHeightsScreen({ navigation }) {
  const [indicatedAlt, setIndicatedAlt] = useState('');
  const [qnh, setQnh] = useState('');
  const [oat, setOat] = useState('');
  const [elevation, setElevation] = useState('');
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
    setIndicatedAlt('');
    setQnh('');
    setOat('');
    setElevation('');
    setResult(null);
    setError('');
  };

  const handleCalculate = () => {
    Keyboard.dismiss();
    setError('');
    
    if (!indicatedAlt) {
      setError('Please enter Indicated Altitude');
      return;
    }

    const altValue = parseFloat(indicatedAlt);
    const qnhValue = qnh && qnh.trim() !== '' ? parseFloat(qnh) : 1013;
    const elev = elevation ? parseFloat(elevation) : 0;

    // Pressure altitude = Indicated altitude + (1013 - QNH) × 30
    const pressureAlt = altValue + ((1013 - qnhValue) * 30);

    // ISA temperature at pressure altitude
    const isaTemp = 15 - (pressureAlt / 1000 * 1.98); // ISA lapse rate: 1.98°C per 1000ft

    // OAT (Outside Air Temperature) - use ISA if not provided
    let oatValue;
    if (oat && oat.trim() !== '') {
      oatValue = parseFloat(oat);
    } else {
      // Default to ISA temperature at this pressure altitude
      oatValue = isaTemp;
    }

    // ISA deviation
    const isaDeviation = oatValue - isaTemp;

    // Density altitude calculation
    // DA = PA + [120 × (OAT - ISA Temp)]
    const densityAlt = pressureAlt + (120 * isaDeviation);

    // Height above ground
    const heightAGL = altValue - elev;

    // True altitude (accounting for temperature deviation)
    // Simplified: TA = PA + (PA × (OAT - ISA_temp) / (273 + ISA_temp))
    const trueAltitude = pressureAlt + (pressureAlt * isaDeviation / (273 + isaTemp));

    setResult({
      indicated: Math.round(altValue),
      pressure: Math.round(pressureAlt),
      density: Math.round(densityAlt),
      trueAltitude: Math.round(trueAltitude),
      heightAGL: Math.round(heightAGL),
      isaTemp: isaTemp.toFixed(1),
      oat: oatValue.toFixed(1),
      isaDeviation: isaDeviation.toFixed(1),
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
          Calculate pressure altitude, density altitude, true altitude, and height AGL
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
          label="OAT (Outside Air Temp at altitude) - °C"
          value={oat}
          onChangeText={setOat}
          placeholder="Optional (defaults to ISA)"
          keyboardType="numeric"
        />
        <Text style={styles.fieldHint}>
          💡 Enter the actual temperature at your current altitude, not ground temperature
        </Text>

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

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Temperature Info:</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>OAT:</Text>
                <Text style={styles.infoValue}>{result.oat}°C</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ISA at this altitude:</Text>
                <Text style={styles.infoValue}>{result.isaTemp}°C</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ISA Deviation:</Text>
                <Text style={[
                  styles.infoValue,
                  { color: parseFloat(result.isaDeviation) > 0 ? '#EF4444' : '#3B82F6' }
                ]}>
                  {result.isaDeviation > 0 ? '+' : ''}{result.isaDeviation}°C
                </Text>
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Indicated Altitude:</Text>
              <Text style={styles.resultValue}>{result.indicated} ft</Text>
              <Text style={styles.resultNote}>Read from altimeter</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Pressure Altitude:</Text>
              <Text style={styles.resultValue}>{result.pressure} ft</Text>
              <Text style={styles.resultNote}>Altitude with QNH set to 1013 hPa</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>True Altitude:</Text>
              <Text style={styles.resultValue}>{result.trueAltitude} ft</Text>
              <Text style={styles.resultNote}>Actual height above MSL (accounting for temp)</Text>
            </View>

            <View style={[styles.resultBox, styles.densityBox]}>
              <Text style={styles.resultLabel}>Density Altitude:</Text>
              <Text style={[styles.resultValue, styles.densityValue]}>
                {result.density} ft
              </Text>
              <Text style={styles.resultNote}>
                Affects aircraft performance
                {parseFloat(result.isaDeviation) > 0 && ' ⚠️ High DA reduces performance'}
              </Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Height AGL:</Text>
              <Text style={styles.resultValue}>{result.heightAGL} ft</Text>
              <Text style={styles.resultNote}>Height above ground level</Text>
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
  fieldHint: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 4,
    fontStyle: 'italic',
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
  infoBox: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
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
  resultNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  densityBox: {
    backgroundColor: '#FEF3C7',
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  densityValue: {
    color: colors.secondary,
  },
});