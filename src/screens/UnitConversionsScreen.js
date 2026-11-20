import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Section, FieldRow, ValueRow, Chips, Segmented, useHeaderReset } from '../components/ui';
import { num } from '../utils/input';
import { space } from '../theme';

const categories = {
  distance: {
    label: 'Distance',
    units: {
      nm: { name: 'Nautical Miles', conversions: [
        { to: 'km', factor: 1.852, name: 'Kilometers' },
        { to: 'mi', factor: 1.15078, name: 'Statute Miles' },
      ] },
      km: { name: 'Kilometers', conversions: [
        { to: 'nm', factor: 0.539957, name: 'Nautical Miles' },
        { to: 'mi', factor: 0.621371, name: 'Statute Miles' },
      ] },
      ft: { name: 'Feet', conversions: [
        { to: 'm', factor: 0.3048, name: 'Meters' },
      ] },
    },
  },
  speed: {
    label: 'Speed',
    units: {
      kts: { name: 'Knots', conversions: [
        { to: 'km/h', factor: 1.852, name: 'km/h' },
        { to: 'mph', factor: 1.15078, name: 'mph' },
        { to: 'm/s', factor: 0.514444, name: 'm/s' },
      ] },
      'km/h': { name: 'km/h', conversions: [
        { to: 'kts', factor: 0.539957, name: 'Knots' },
        { to: 'mph', factor: 0.621371, name: 'mph' },
      ] },
    },
  },
  pressure: {
    label: 'Pressure',
    units: {
      hPa: { name: 'hPa', conversions: [{ to: 'inHg', factor: 0.02953, name: 'inHg' }] },
      inHg: { name: 'inHg', conversions: [{ to: 'hPa', factor: 33.8639, name: 'hPa' }] },
    },
  },
  temperature: {
    label: 'Temperature',
    units: {
      '°C': { name: '°C', conversions: [{ to: '°F', formula: (c) => (c * 9) / 5 + 32, name: '°F' }] },
      '°F': { name: '°F', conversions: [{ to: '°C', formula: (f) => ((f - 32) * 5) / 9, name: '°C' }] },
    },
  },
  weight: {
    label: 'Weight',
    units: {
      kg: { name: 'Kilograms', conversions: [{ to: 'lbs', factor: 2.20462, name: 'Pounds' }] },
      lbs: { name: 'Pounds', conversions: [{ to: 'kg', factor: 0.453592, name: 'Kilograms' }] },
    },
  },
  volume: {
    label: 'Fuel volume',
    units: {
      L: { name: 'Liters', conversions: [{ to: 'gal', factor: 0.264172, name: 'US Gallons' }] },
      gal: { name: 'US Gallons', conversions: [{ to: 'L', factor: 3.78541, name: 'Liters' }] },
    },
  },
};

const UNIT_LABEL = { kts: 'kt', nm: 'NM' };
const label = (u) => UNIT_LABEL[u] || u;

export default function UnitConversionsScreen({ navigation }) {
  const [category, setCategory] = useState('distance');
  const [fromUnit, setFromUnit] = useState('nm');
  const [value, setValue] = useState('');

  useHeaderReset(navigation, () => setValue(''), !!value);

  const pickCategory = (key) => {
    setCategory(key);
    setFromUnit(Object.keys(categories[key].units)[0]);
  };

  const units = categories[category].units;
  const results = useMemo(() => {
    const v = num(value);
    if (v === null) return null;
    return units[fromUnit].conversions.map((conv) => ({
      ...conv,
      value: (conv.formula ? conv.formula(v) : v * conv.factor).toFixed(2),
    }));
  }, [value, fromUnit, category]);

  return (
    <Screen>
      <View style={styles.chips}>
        <Chips
          options={Object.entries(categories).map(([key, c]) => ({ value: key, label: c.label }))}
          value={category}
          onChange={pickCategory}
        />
      </View>

      <Segmented
        style={styles.seg}
        options={Object.keys(units).map((u) => ({ value: u, label: label(u) }))}
        value={fromUnit}
        onChange={setFromUnit}
      />

      <Section>
        <FieldRow
          label="Value"
          value={value}
          onChangeText={setValue}
          placeholder="0"
          keyboardType={category === 'temperature' ? 'numbers-and-punctuation' : 'decimal-pad'}
          unit={label(fromUnit)}
        />
      </Section>

      {results ? (
        <Section>
          {results.map((r) => <ValueRow key={r.to} label={r.name} value={r.value} unit={label(r.to)} />)}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { marginTop: space.l, marginHorizontal: -0 },
  seg: { marginHorizontal: space.l, marginTop: space.l },
});
