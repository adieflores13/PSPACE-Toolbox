import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';
import { getMetarTaf } from '../utils/metarApi';

export default function MetarTafScreen({ navigation }) {
  const [airport, setAirport] = useState('');
  const [loading, setLoading] = useState(false);
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
    setAirport('');
    setResult(null);
    setError('');
  };

  const handleGetWeather = async () => {
    Keyboard.dismiss();
    
    if (!airport.trim()) {
      setError('Please enter an airport code');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const data = await getMetarTaf(airport);
    
    setLoading(false);
    
    if (data.success) {
      setResult(data);
    } else {
      setError(data.error);
    }
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
          label="Airport Code"
          value={airport}
          onChangeText={setAirport}
          placeholder=""
        />
        
        <Button 
          title="Get METAR + TAF" 
          onPress={handleGetWeather}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching weather data...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.airportCode}>{result.airport}:</Text>
            
            <View style={styles.dataSection}>
              <Text style={styles.label}>METAR:</Text>
              <Text style={styles.dataText}>{result.metar}</Text>
            </View>
            
            <View style={styles.dataSection}>
              <Text style={styles.label}>TAF:</Text>
              <Text style={styles.dataText}>{result.taf}</Text>
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
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
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
  airportCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
  },
  dataSection: {
    marginBottom: 20,
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});