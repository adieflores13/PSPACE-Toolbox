import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Modal } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';

export default function UnitConversionsScreen({ navigation }) {
  const [value, setValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('distance');
  const [selectedFromUnit, setSelectedFromUnit] = useState('nm'); // Initialize with default
  const [result, setResult] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

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
      units: {
        'nm': { name: 'Nautical Miles', conversions: [
          { to: 'km', factor: 1.852, name: 'Kilometers' },
          { to: 'mi', factor: 1.15078, name: 'Statute Miles' },
        ]},
        'km': { name: 'Kilometers', conversions: [
          { to: 'nm', factor: 0.539957, name: 'Nautical Miles' },
          { to: 'mi', factor: 0.621371, name: 'Statute Miles' },
        ]},
        'ft': { name: 'Feet', conversions: [
          { to: 'm', factor: 0.3048, name: 'Meters' },
        ]},
      }
    },
    speed: {
      label: 'Speed',
      units: {
        'kts': { name: 'Knots', conversions: [
          { to: 'km/h', factor: 1.852, name: 'km/h' },
          { to: 'mph', factor: 1.15078, name: 'mph' },
          { to: 'm/s', factor: 0.514444, name: 'm/s' },
        ]},
        'km/h': { name: 'km/h', conversions: [
          { to: 'kts', factor: 0.539957, name: 'Knots' },
          { to: 'mph', factor: 0.621371, name: 'mph' },
        ]},
      }
    },
    pressure: {
      label: 'Pressure',
      units: {
        'hPa': { name: 'hPa', conversions: [
          { to: 'inHg', factor: 0.02953, name: 'inHg' },
        ]},
        'inHg': { name: 'inHg', conversions: [
          { to: 'hPa', factor: 33.8639, name: 'hPa' },
        ]},
      }
    },
    temperature: {
      label: 'Temperature',
      units: {
        '°C': { name: '°C', conversions: [
          { to: '°F', formula: (c) => (c * 9/5) + 32, name: '°F' },
        ]},
        '°F': { name: '°F', conversions: [
          { to: '°C', formula: (f) => (f - 32) * 5/9, name: '°C' },
        ]},
      }
    },
    weight: {
      label: 'Weight',
      units: {
        'kg': { name: 'Kilograms', conversions: [
          { to: 'lbs', factor: 2.20462, name: 'Pounds' },
        ]},
        'lbs': { name: 'Pounds', conversions: [
          { to: 'kg', factor: 0.453592, name: 'Kilograms' },
        ]},
      }
    },
    volume: {
      label: 'Volume (Fuel)',
      units: {
        'L': { name: 'Liters', conversions: [
          { to: 'gal', factor: 0.264172, name: 'US Gallons' },
        ]},
        'gal': { name: 'US Gallons', conversions: [
          { to: 'L', factor: 3.78541, name: 'Liters' },
        ]},
      }
    },
  };

  // Set default "from" unit when category changes
  React.useEffect(() => {
    const firstUnit = Object.keys(categories[selectedCategory].units)[0];
    setSelectedFromUnit(firstUnit);
    setResult(null);
    setValue('');
  }, [selectedCategory]);

  const handleConvert = () => {
    Keyboard.dismiss();
    if (!value || !selectedFromUnit) return;

    const val = parseFloat(value);
    const fromUnitData = categories[selectedCategory].units[selectedFromUnit];
    const results = [];

    fromUnitData.conversions.forEach(conv => {
      let converted;
      if (conv.formula) {
        converted = conv.formula(val);
      } else {
        converted = val * conv.factor;
      }
      results.push({
        from: `${val} ${selectedFromUnit}`,
        to: `${converted.toFixed(2)} ${conv.to}`,
      });
    });

    setResult(results);
  };

  const availableUnits = categories[selectedCategory].units;

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
        <Text style={styles.label}>Conversion Category:</Text>
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.dropdownText}>{categories[selectedCategory].label}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <InputField
          label="Value to convert"
          value={value}
          onChangeText={setValue}
          placeholder=""
          keyboardType="decimal-pad"
        />

        {Object.keys(availableUnits).length > 1 && (
          <>
            <Text style={styles.label}>Convert from:</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowUnitModal(true)}
            >
              <Text style={styles.dropdownText}>
                {availableUnits[selectedFromUnit]?.name || 'Select unit'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </>
        )}

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

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {Object.entries(categories).map(([key, cat]) => (
              <TouchableOpacity
                key={key}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedCategory(key);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{cat.label}</Text>
                {selectedCategory === key && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Unit Modal */}
      <Modal
        visible={showUnitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUnitModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Convert From</Text>
            {Object.entries(availableUnits).map(([key, unit]) => (
              <TouchableOpacity
                key={key}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedFromUnit(key);
                  setShowUnitModal(false);
                  setResult(null);
                }}
              >
                <Text style={styles.modalOptionText}>{unit.name}</Text>
                {selectedFromUnit === key && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 5,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  checkmark: {
    fontSize: 18,
    color: colors.secondary,
    fontWeight: 'bold',
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