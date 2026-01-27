import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard, Switch } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';

export default function AirSpeedsScreen({ navigation }) {
  const [ias, setIas] = useState('');
  const [altitude, setAltitude] = useState('');
  const [qnh, setQnh] = useState('1013');
  const [oat, setOat] = useState('');
  const [includeWind, setIncludeWind] = useState(false);
  const [heading, setHeading] = useState('');
  const [windDirection, setWindDirection] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
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
    setIas('');
    setAltitude('');
    setQnh('1013');
    setOat('');
    setIncludeWind(false);
    setHeading('');
    setWindDirection('');
    setWindSpeed('');
    setResult(null);
    setError('');
  };

  // Calculate Pressure Altitude
  const calculatePressureAltitude = (indicatedAltitude, qnhValue) => {
    return indicatedAltitude + ((1013 - qnhValue) * 30);
  };

  // Calculate TAS
  const calculateTAS = (cas, pressureAltitude, oatValue) => {
    const isaTemp = 15 - (pressureAltitude / 1000 * 1.98);
    const tempK = oatValue + 273.15;
    const isaTempK = isaTemp + 273.15;
    const pressureRatio = Math.pow(1 - (pressureAltitude * 0.0000068756), 5.2561);
    const tas = cas * Math.sqrt(tempK / isaTempK) / Math.sqrt(pressureRatio);
    return tas;
  };

  // Calculate Mach
  const calculateMach = (tas, oatValue) => {
    const tempK = oatValue + 273.15;
    const speedOfSound = 38.967854 * Math.sqrt(tempK);
    return tas / speedOfSound;
  };

  // Calculate Ground Speed
  const calculateGroundSpeed = (tas, hdg, windDir, windSpd) => {
    const headingRad = hdg * Math.PI / 180;
    const windDirRad = windDir * Math.PI / 180;
    
    // Wind is FROM direction, so we need to reverse it (add 180°)
    const windTowardRad = windDirRad + Math.PI;
    
    const windNorth = windSpd * Math.cos(windTowardRad);
    const windEast = windSpd * Math.sin(windTowardRad);
    
    const acNorth = tas * Math.cos(headingRad);
    const acEast = tas * Math.sin(headingRad);
    
    const gsNorth = acNorth + windNorth;
    const gsEast = acEast + windEast;
    
    return Math.sqrt(gsNorth * gsNorth + gsEast * gsEast);
  };

  const handleCalculate = () => {
    Keyboard.dismiss();
    setError('');
    
    if (!ias || !altitude) {
      setError('Please enter IAS and Altitude');
      return;
    }

    const iasValue = parseFloat(ias);
    const altValue = parseFloat(altitude);
    const qnhValue = parseFloat(qnh);
    
    // Calculate pressure altitude
    const pressureAlt = calculatePressureAltitude(altValue, qnhValue);
    
    // OAT - use ISA if not provided
    let oatValue;
    if (oat && oat.trim() !== '') {
      oatValue = parseFloat(oat);
    } else {
      // Default to ISA temperature at pressure altitude
      oatValue = 15 - (pressureAlt / 1000 * 1.98);
    }

    // For light aircraft, CAS ≈ IAS
    const cas = iasValue;
    
    // Calculate TAS
    const tas = calculateTAS(cas, pressureAlt, oatValue);
    
    // Calculate Mach
    const mach = calculateMach(tas, oatValue);
    
    // Calculate Ground Speed if wind enabled
    let groundSpeed = null;
    if (includeWind) {
      if (!heading || !windDirection || !windSpeed) {
        setError('Please enter all wind fields or disable wind calculation');
        return;
      }
      groundSpeed = calculateGroundSpeed(
        tas, 
        parseFloat(heading), 
        parseFloat(windDirection), 
        parseFloat(windSpeed)
      );
    }

    setResult({
      ias: Math.round(iasValue),
      cas: Math.round(cas),
      tas: Math.round(tas),
      mach: mach.toFixed(3),
      groundSpeed: groundSpeed !== null ? Math.round(groundSpeed) : null,
      pressureAlt: Math.round(pressureAlt),
      oat: oatValue.toFixed(1),
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
          Calculate IAS, CAS, TAS, Mach number, and optionally Ground Speed
        </Text>

        <InputField
          label="IAS (Indicated Airspeed) - kts"
          value={ias}
          onChangeText={setIas}
          placeholder=""
          keyboardType="numeric"
        />

        <InputField
          label="Indicated Altitude - feet"
          value={altitude}
          onChangeText={setAltitude}
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

        <View style={styles.windToggleContainer}>
          <View style={styles.windToggleRow}>
            <Text style={styles.windToggleLabel}>Include Ground Speed (with wind)</Text>
            <Switch
              value={includeWind}
              onValueChange={setIncludeWind}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor={includeWind ? colors.white : '#F3F4F6'}
            />
          </View>
          <Text style={styles.windToggleHint}>
            Enable to calculate ground speed using wind data
          </Text>
        </View>

        {includeWind && (
          <View style={styles.windInputsContainer}>
            <Text style={styles.windSectionTitle}>Wind Data</Text>
            
            <InputField
              label="Aircraft Heading - degrees"
              value={heading}
              onChangeText={setHeading}
              placeholder=""
              keyboardType="numeric"
            />

            <InputField
              label="Wind Direction (FROM) - degrees"
              value={windDirection}
              onChangeText={setWindDirection}
              placeholder=""
              keyboardType="numeric"
            />

            <InputField
              label="Wind Speed - kts"
              value={windSpeed}
              onChangeText={setWindSpeed}
              placeholder=""
              keyboardType="numeric"
            />
          </View>
        )}

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
              <Text style={styles.infoText}>
                Pressure Altitude: {result.pressureAlt} ft • OAT: {result.oat}°C
              </Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>IAS (Indicated Airspeed):</Text>
              <Text style={styles.resultValue}>{result.ias} kts</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>CAS (Calibrated Airspeed):</Text>
              <Text style={styles.resultValue}>{result.cas} kts</Text>
              <Text style={styles.resultNote}>≈ IAS for light aircraft</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>TAS (True Airspeed):</Text>
              <Text style={styles.resultValue}>{result.tas} kts</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Mach Number:</Text>
              <Text style={styles.resultValue}>{result.mach}</Text>
            </View>

            {result.groundSpeed !== null && (
              <View style={[styles.resultBox, styles.groundSpeedBox]}>
                <Text style={styles.resultLabel}>Ground Speed:</Text>
                <Text style={[styles.resultValue, styles.groundSpeedValue]}>
                  {result.groundSpeed} kts
                </Text>
              </View>
            )}
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
  windToggleContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  windToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  windToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  windToggleHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  windInputsContainer: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  windSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
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
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
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
    marginTop: 4,
    fontStyle: 'italic',
  },
  groundSpeedBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  groundSpeedValue: {
    color: '#10B981',
  },
});