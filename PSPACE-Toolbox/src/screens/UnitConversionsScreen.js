import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';

export default function UnitConversionsScreen({ navigation }) {
  const [value, setValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('distance');
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
    setValue('');
    setResult(null);
  };

  const categories = {
    distance: {
      label: 'Distance',
      conversions: [
        { from: 'Nautical Miles', to: 'Kilometers', factor: 1.852 },
        { from: 'Nautical Miles', to: 'Statute Miles', factor: 1.15078 },
        { from: 'Feet', to: 'Meters', factor: 0.3048 },
      ]
    },
    speed: {
      label: 'Speed',
      conversions: [
        { from: 'Knots', to: 'km/h', factor: 1.852 },
        { from: 'Knots', to: 'mph', factor: 1.15078 },
        { from: 'Knots', to: 'm/s', factor: 0.514444 },
      ]
    },
    pressure: {
      label: 'Pressure',
      conversions: [
        { from: 'hPa', to: 'inHg', factor: 0.02953 },
        { from: 'inHg', to: 'hPa', factor: 33.8639 },
      ]
    },
    temperature: {
      label: 'Temperature',
      conversions: [
        { from: '°C', to: '°F', formula: (c) => (c * 9/5) + 32 },
        { from: '°F', to: '°C', formula: (f) => (f - 32) * 5/9 },
      ]
    },
    weight: {
      label: 'Weight',
      conversions: [
        { from: 'Kilograms', to: 'Pounds', factor: 2.20462 },
        { from: 'Pounds', to: 'Kilograms', factor: 0.453592 },
      ]
    },
    volume: {
      label: 'Volume (Fuel)',
      conversions: [
        { from: 'Liters', to: 'US Gallons', factor: 0.264172 },
        { from: 'US Gallons', to: 'Liters', factor: 3.78541 },
      ]
    },
  };

  const handleConvert = () => {
    Keyboard.dismiss();
    if (!value) return;

    const val = parseFloat(value);
    const category = categories[selectedCategory];
    const results = [];

    category.conversions.forEach(conv => {
      let converted;
      if (conv.formula) {
        converted = conv.formula(val);
      } else {
        converted = val * conv.factor;
      }
      results.push({
        from: `${val} ${conv.from}`,
        to: `${converted.toFixed(2)} ${conv.to}`,
      });
    });

    setResult(results);
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
        <Text style={styles.description}>Select conversion category:</Text>

        <View style={styles.categoryContainer}>
          {Object.keys(categories).map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryButton,
                selectedCategory === key && styles.categoryButtonActive
              ]}
              onPress={() => {
                setSelectedCategory(key);
                setResult(null);
              }}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === key && styles.categoryTextActive
              ]}>
                {categories[key].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <InputField
          label="Value to convert"
          value={value}
          onChangeText={setValue}
          placeholder=""
          keyboardType="decimal-pad"
        />

        <Button 
          title="CONVERT" 
          onPress={handleConvert}
        />

        {result && (
          <View style={styles.resultContainer}>
            {result.map((item, index) => (
              <View key={index} style={styles.resultBox}>
                <Text style={styles.fromText}>{item.from}</Text>
                <Text style={styles.arrow}>↓</Text>
                <Text style={styles.toText}>{item.to}</Text>
              </View>
            ))}
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
    marginBottom: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    margin: 4,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  fromText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: colors.secondary,
    marginVertical: 8,
  },
  toText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
});