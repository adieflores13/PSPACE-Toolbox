import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';
import { calculateWindCorrectedHeading } from '../utils/calculations';

export default function WindCorrectedHeadingsScreen({ navigation }) {
  const [track, setTrack] = useState('');
  const [tas, setTas] = useState('');
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
    setTrack('');
    setTas('');
    setWind('');
    setResult(null);
    setError('');
  };

  const handleCalculate = () => {
    Keyboard.dismiss();
    setError('');
    
    if (!track.trim() || !tas.trim() || !wind.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Parse wind (format: 090/23)
    const windParts = wind.split('/');
    if (windParts.length !== 2) {
      setError('Wind format should be: direction/speed (e.g., 090/23)');
      return;
    }

    const windDirection = windParts[0];
    const windSpeed = windParts[1];

    const calculated = calculateWindCorrectedHeading(track, tas, windDirection, windSpeed);
    
    // Add input data to result for display
    setResult({
      ...calculated,
      track: track,
      tas: tas,
      windDirection: windDirection,
      windSpeed: windSpeed,
    });
  };

  const getDriftDirection = () => {
    if (!result || !result.drift) return '';
    return result.drift > 0 ? 'Right' : 'Left';
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
          label="Track (desired ground track)"
          value={track}
          onChangeText={setTrack}
          placeholder=""
          keyboardType="numeric"
        />
        
        <InputField
          label="TAS (True Airspeed)"
          value={tas}
          onChangeText={setTas}
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
              <Text style={styles.resultLabel}>Heading to Fly:</Text>
              <Text style={styles.resultValue}>{result.heading}°</Text>
              {result.drift !== undefined && (
                <Text style={styles.resultSubtext}>
                  Drift: {Math.abs(result.drift).toFixed(1)}° {getDriftDirection()}
                </Text>
              )}
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Ground Speed:</Text>
              <Text style={styles.resultValue}>{result.groundSpeed} kts</Text>
            </View>

            <View style={styles.diagramContainer}>
              <Text style={styles.diagramTitle}>Navigation Triangle</Text>
              
              <View style={styles.visualBox}>
                <Text style={styles.infoText}>
                  Track: {result.track}° • TAS: {result.tas} kts • Wind: {result.windDirection}°/{result.windSpeed} kts
                </Text>
                
                <View style={styles.diagram}>
                  {/* North indicator */}
                  <View style={styles.compassContainer}>
                    <Text style={styles.compassText}>N</Text>
                    <Text style={styles.compassDegree}>360°</Text>
                  </View>
                  
                  {/* Track line (where you want to go) */}
                  <View style={styles.centerPoint}>
                    <View 
                      style={[
                        styles.trackVector,
                        { transform: [{ rotate: `${parseFloat(result.track)}deg` }] }
                      ]}
                    >
                      <View style={styles.trackLine} />
                      <View style={styles.trackArrow}>
                        <Text style={styles.trackArrowSymbol}>▲</Text>
                      </View>
                      <View style={styles.trackLabel}>
                        <Text style={styles.trackLabelText}>TRACK</Text>
                        <Text style={styles.trackDegreeText}>{result.track}°</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Heading line (where you point the aircraft) */}
                  <View style={styles.centerPoint}>
                    <View 
                      style={[
                        styles.headingVector,
                        { transform: [{ rotate: `${result.heading}deg` }] }
                      ]}
                    >
                      <View style={styles.headingLine} />
                      <View style={styles.aircraftContainer}>
                        <Text style={styles.aircraftSymbol}>✈</Text>
                      </View>
                      <View style={styles.headingLabel}>
                        <Text style={styles.headingLabelText}>HEADING</Text>
                        <Text style={styles.headingDegreeText}>{result.heading}°</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Wind vector */}
                  <View style={styles.centerPoint}>
                    <View 
                      style={[
                        styles.windVector,
                        { transform: [{ rotate: `${parseFloat(result.windDirection)}deg` }] }
                      ]}
                    >
                      <View style={styles.windArrowTip}>
                        <Text style={styles.windArrowSymbol}>▼</Text>
                      </View>
                      <View style={styles.windLine} />
                      <View style={styles.windLabelSmall}>
                        <Text style={styles.windLabelTextSmall}>WIND</Text>
                        <Text style={styles.windDegreeTextSmall}>{result.windDirection}°</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Center dot */}
                  <View style={styles.centerDot} />
                </View>
                
                <View style={styles.legendBox}>
                  <Text style={styles.legendTitle}>Navigation Solution:</Text>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendIndicator, { backgroundColor: '#3B82F6' }]} />
                      <Text style={styles.legendText}>Track: {result.track}° (desired ground track)</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendIndicator, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.legendText}>Heading: {result.heading}° (aircraft pointing)</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendIndicator, { backgroundColor: '#F59E0B' }]} />
                      <Text style={styles.legendText}>Wind: FROM {result.windDirection}° at {result.windSpeed} kts</Text>
                    </View>
                  </View>
                  
                  {result.drift !== undefined && (
                    <View style={styles.driftExplanation}>
                      <Text style={styles.driftText}>
                        💡 Fly heading {result.heading}° to maintain track {result.track}°
                      </Text>
                      <Text style={styles.driftText}>
                        (Drift correction: {Math.abs(result.drift).toFixed(1)}° {getDriftDirection()})
                      </Text>
                    </View>
                  )}
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
  resultSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
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
    fontSize: 12,
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
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  // Track vector (blue - desired path)
  trackVector: {
    position: 'absolute',
    height: 140,
    width: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  trackLine: {
    width: 2,
    height: 80,
    backgroundColor: '#3B82F6',
    marginTop: 20,
  },
  trackArrow: {
    marginTop: -2,
  },
  trackArrowSymbol: {
    fontSize: 24,
    color: '#3B82F6',
  },
  trackLabel: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 6,
    alignItems: 'center',
  },
  trackLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  trackDegreeText: {
    fontSize: 9,
    color: colors.white,
    marginTop: 1,
  },
  // Heading vector (green - aircraft pointing)
  headingVector: {
    position: 'absolute',
    height: 160,
    width: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headingLine: {
    width: 3,
    height: 90,
    backgroundColor: '#10B981',
    marginTop: 20,
  },
  aircraftContainer: {
    marginTop: 2,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  aircraftSymbol: {
    fontSize: 20,
  },
  headingLabel: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 6,
    alignItems: 'center',
  },
  headingLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  headingDegreeText: {
    fontSize: 9,
    color: colors.white,
    marginTop: 1,
  },
  // Wind vector (orange)
  windVector: {
    position: 'absolute',
    height: 120,
    width: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  windArrowTip: {
    marginTop: 30,
  },
  windArrowSymbol: {
    fontSize: 20,
    color: colors.secondary,
  },
  windLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.secondary,
    marginTop: 3,
  },
  windLabelSmall: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
    alignItems: 'center',
  },
  windLabelTextSmall: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.white,
  },
  windDegreeTextSmall: {
    fontSize: 8,
    color: colors.white,
    marginTop: 1,
  },
  // Legend
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
  legendRow: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  driftExplanation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  driftText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});