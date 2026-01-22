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

    // Validate runway (01-36)
    const runwayNum = parseInt(runway);
    if (isNaN(runwayNum) || runwayNum < 1 || runwayNum > 36) {
      setError('Runway must be between 01 and 36');
      return;
    }

    const windParts = wind.split('/');
    if (windParts.length !== 2) {
      setError('Wind format should be: direction/speed (e.g., 120/8)');
      return;
    }

    const windDirection = windParts[0];
    const windSpeed = windParts[1];

    // Format runway to 2 digits
    const formattedRunway = runwayNum.toString().padStart(2, '0');

    const calculated = calculateWindComponent(formattedRunway, windDirection, windSpeed);
    
    // Determine crosswind side
    const runwayHeading = parseInt(formattedRunway) * 10;
    const windDir = parseInt(windDirection);
    const angleDiff = (windDir - runwayHeading + 360) % 360;
    const crosswindSide = angleDiff > 180 ? 'Left' : 'Right';
    
    setResult({
      ...calculated,
      windDirection,
      windSpeed,
      runway: formattedRunway,
      crosswindSide,
    });
  };

  const getWindArrowRotation = () => {
    if (!result) return 0;
    
    // Wind is FROM direction, so arrow points TOWARDS where wind comes from
    const windDir = parseInt(result.windDirection);
    return windDir;
  };

  const getRunwayRotation = () => {
    if (!result) return 0;
    
    // Runway heading (aircraft going towards)
    const runwayHeading = parseInt(result.runway) * 10;
    return runwayHeading;
  };

  // Generate runway options 01-36
  const runwayOptions = Array.from({ length: 36 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    return num;
  });

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
          label="Runway (01-36)"
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
                {result.isHeadwind ? 'Headwind:' : 'Tailwind:'}
              </Text>
              <Text style={styles.resultValue}>
                {Math.abs(result.headwind)} kts
              </Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>
                Crosswind ({result.crosswindSide}):
              </Text>
              <Text style={styles.resultValue}>{result.crosswind} kts</Text>
            </View>

            <View style={styles.diagramContainer}>
              <Text style={styles.diagramTitle}>Visual Representation</Text>
              
              <View style={styles.visualBox}>
                <Text style={styles.infoText}>
                  Runway {result.runway} • Wind {result.windDirection}°/{result.windSpeed}kts
                </Text>
                
                <View style={styles.diagram}>
                  {/* Compass directions */}
                  <View style={styles.compassContainer}>
                    <Text style={styles.compassText}>N (360°)</Text>
                  </View>
                  
                  {/* Runway with aircraft direction */}
                  <View style={styles.runwayContainer}>
                    <View 
                      style={[
                        styles.runwayRect,
                        { transform: [{ rotate: `${getRunwayRotation()}deg` }] }
                      ]}
                    >
                      <View style={styles.runwayInner}>
                        <Text style={styles.runwayLabel}>{result.runway}</Text>
                        <Text style={styles.aircraftArrow}>✈</Text>
                        <Text style={styles.directionLabel}>Aircraft →</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Wind direction (FROM) */}
                  <View style={styles.windContainer}>
                    <View 
                      style={[
                        styles.windArrowContainer,
                        { transform: [{ rotate: `${getWindArrowRotation() + 180}deg` }] }
                      ]}
                    >
                      <Text style={styles.windArrowLarge}>→</Text>
                    </View>
                    <Text style={styles.windFromLabel}>
                      Wind FROM {result.windDirection}°
                    </Text>
                  </View>
                </View>
                
                <View style={styles.legendBox}>
                  <Text style={styles.legendTitle}>Components:</Text>
                  <Text style={styles.legendItem}>
                    • {result.isHeadwind ? 'Headwind' : 'Tailwind'}: {Math.abs(result.headwind)} kts (along runway)
                  </Text>
                  <Text style={styles.legendItem}>
                    • Crosswind: {result.crosswind} kts (from {result.crosswindSide.toLowerCase()})
                  </Text>
                </View>
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
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  errorText: {
    color: '#92400E',
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
  },
  diagramTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  visualBox: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  diagram: {
    width: 300,
    height: 300,
    position: 'relative',
    backgroundColor: '#E8F4F8',
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#B8D4E0',
  },
  compassContainer: {
    position: 'absolute',
    top: 15,
  },
  compassText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: 'bold',
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  runwayContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  runwayRect: {
    width: 140,
    height: 50,
    backgroundColor: '#D1D5DB',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#9CA3AF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  runwayInner: {
    alignItems: 'center',
  },
  runwayLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  aircraftArrow: {
    fontSize: 24,
    marginTop: 2,
  },
  directionLabel: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
    fontWeight: 'bold',
  },
  windContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: 60,
  },
  windArrowContainer: {
    marginBottom: 10,
    backgroundColor: 'rgba(255, 181, 71, 0.2)',
    padding: 15,
    borderRadius: 50,
  },
  windArrowLarge: {
    fontSize: 50,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  windFromLabel: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: 'bold',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  legendBox: {
    width: '100%',
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  legendItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
});