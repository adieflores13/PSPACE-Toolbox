import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';
import { convertGradient, calculateRateOfClimbDescent } from '../utils/calculations';

export default function ClimbDescentScreen({ navigation }) {
  const [gradientDeg, setGradientDeg] = useState('');
  const [gradientPct, setGradientPct] = useState('');
  const [gradientFtNm, setGradientFtNm] = useState('');
  const [groundSpeed, setGroundSpeed] = useState('');
  const [converted, setConverted] = useState(null);
  const [rate, setRate] = useState(null);

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
    setGradientDeg('');
    setGradientPct('');
    setGradientFtNm('');
    setGroundSpeed('');
    setConverted(null);
    setRate(null);
  };

  const handleConvert = () => {
    Keyboard.dismiss();
    let result;
    if (gradientDeg) {
      result = convertGradient(gradientDeg, 'degrees');
      setGradientPct(result.percent);
      setGradientFtNm(result.ftPerNm);
    } else if (gradientPct) {
      result = convertGradient(gradientPct, 'percent');
      setGradientDeg(result.degrees);
      setGradientFtNm(result.ftPerNm);
    } else if (gradientFtNm) {
      result = convertGradient(gradientFtNm, 'ftPerNm');
      setGradientDeg(result.degrees);
      setGradientPct(result.percent);
    }
    setConverted(result);
  };

  const handleCalculateRate = () => {
    Keyboard.dismiss();
    if (!gradientFtNm || !groundSpeed) {
      return;
    }
    const calculatedRate = calculateRateOfClimbDescent(gradientFtNm, groundSpeed);
    setRate(calculatedRate);
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
        <Text style={styles.sectionTitle}>Gradient Conversion</Text>
        
        <InputField
          label="Gradient (°)"
          value={gradientDeg}
          onChangeText={setGradientDeg}
          placeholder=""
          keyboardType="decimal-pad"
        />
        
        <InputField
          label="Gradient (%)"
          value={gradientPct}
          onChangeText={setGradientPct}
          placeholder=""
          keyboardType="decimal-pad"
        />
        
        <InputField
          label="Gradient (ft/nm)"
          value={gradientFtNm}
          onChangeText={setGradientFtNm}
          placeholder=""
          keyboardType="decimal-pad"
        />
        
        <Button 
          title="CONVERT" 
          onPress={handleConvert}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Rate of Climb/Descent</Text>
        
        <InputField
          label="Ground Speed (kts)"
          value={groundSpeed}
          onChangeText={setGroundSpeed}
          placeholder=""
          keyboardType="numeric"
        />
        
        <Button 
          title="CALCULATE RATE" 
          onPress={handleCalculateRate}
        />

        {rate !== null && (
          <View style={styles.resultContainer}>
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Rate of Climb/Descent:</Text>
              <Text style={styles.resultValue}>{rate} ft/min</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 25,
  },
  resultContainer: {
    marginTop: 20,
  },
  resultBox: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 8,
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