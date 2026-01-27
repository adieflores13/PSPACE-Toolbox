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
    
    // Calculate the relative angle (normalized to -180 to +180)
    let relativeAngle = windDir - runwayHeading;
    if (relativeAngle > 180) relativeAngle -= 360;
    if (relativeAngle < -180) relativeAngle += 360;
    
    // Crosswind from right if wind is clockwise from runway heading
    const crosswindSide = relativeAngle > 0 ? 'Right' : 'Left';
    
    setResult({
      ...calculated,
      windDirection,
      windSpeed,
      runway: formattedRunway,
      crosswindSide,
      relativeAngle: Math.abs(relativeAngle),
    });
  };

  const getWindOriginAngle = () => {
    if (!result) return 0;
    // Wind is FROM this direction - arrow should point from wind origin
    return parseInt(result.windDirection);
  };

  const getRunwayHeading = () => {
    if (!result) return 0;
    return parseInt(result.runway) * 10;
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
          keyboardType="numbers-and-punctuation"
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
                  Runway {result.runway} ({getRunwayHeading()}°) • Wind FROM {result.windDirection}°/{result.windSpeed}kts
                </Text>
                
                <View style={styles.diagram}>
                  {/* North indicator */}
                  <View style={styles.compassContainer}>
                    <Text style={styles.compassText}>N</Text>
                    <Text style={styles.compassDegree}>360°</Text>
                  </View>
                  
                  {/* Runway*/}
                  <View style={styles.centerPoint}>
                    <View 
                      style={[
                        styles.runwayLine,
                        { transform: [{ rotate: `${getRunwayHeading()}deg` }] }
                      ]}
                    >
                      <View style={styles.runwayRect}>
                        <Text style={styles.runwayLabel}>{result.runway}</Text>
                      </View>
                      <View style={styles.aircraftContainer}>
                        <Text style={styles.aircraftSymbol}>✈</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Wind arrowww - showing FROM direction */}
                  <View style={styles.centerPoint}>
                    <View 
                      style={[
                        styles.windVector,
                        { transform: [{ rotate: `${getWindOriginAngle()}deg` }] }
                      ]}
                    >
                      {/* Wind comes FROM this direction (arrow points inward) */}
                      <View style={styles.windArrowTip}>
                        <Text style={styles.windArrowSymbol}>▼</Text>
                      </View>
                      <View style={styles.windLine} />
                      <View style={styles.windLabel}>
                        <Text style={styles.windLabelText}>WIND</Text>
                        <Text style={styles.windDegreeText}>{result.windDirection}°</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Angle arc indicator */}
                  <View style={styles.angleIndicator}>
                    <Text style={styles.angleText}>{result.relativeAngle}°</Text>
                  </View>
                </View>
                
                <View style={styles.legendBox}>
                  <Text style={styles.legendTitle}>Wind Components:</Text>
                  <View style={styles.componentRow}>
                    <View style={styles.componentBox}>
                      <Text style={styles.componentLabel}>Along Runway</Text>
                      <Text style={styles.componentValue}>
                        {result.isHeadwind ? 'Headwind' : 'Tailwind'}
                      </Text>
                      <Text style={styles.componentNumber}>{Math.abs(result.headwind)} kts</Text>
                    </View>
                    <View style={styles.componentBox}>
                      <Text style={styles.componentLabel}>Across Runway</Text>
                      <Text style={styles.componentValue}>
                        Crosswind ({result.crosswindSide})
                      </Text>
                      <Text style={styles.componentNumber}>{result.crosswind} kts</Text>
                    </View>
                  </View>
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
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  diagram: {
    width: 320,
    height: 320,
    position: 'relative',
    backgroundColor: '#F0F9FF',
    borderRadius: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  compassContainer: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
  },
  compassText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  compassDegree: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  centerPoint: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  runwayLine: {
    position: 'absolute',
    height: 200,
    width: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  runwayRect: {
    width: 60,
    height: 140,
    backgroundColor: '#6B7280',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  runwayLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  aircraftContainer: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  aircraftSymbol: {
    fontSize: 20,
  },
  windVector: {
    position: 'absolute',
    height: 180,
    width: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  windArrowTip: {
    marginTop: 20,
  },
  windArrowSymbol: {
    fontSize: 30,
    color: colors.secondary,
  },
  windLine: {
    width: 3,
    height: 60,
    backgroundColor: colors.secondary,
    marginTop: 5,
  },
  windLabel: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  windLabelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
  },
  windDegreeText: {
    fontSize: 10,
    color: colors.white,
    marginTop: 2,
  },
  angleIndicator: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  angleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  legendBox: {
    width: '100%',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  componentBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  componentLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  componentValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  componentNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
});