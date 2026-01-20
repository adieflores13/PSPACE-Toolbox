import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../components/Button';
import colors from '../constants/colors';

export default function MainMenuScreen({ navigation }) {
  const menuItems = [
    { title: 'METAR/TAF', screen: 'MetarTaf' },
    { title: 'Wind Component', screen: 'WindComponent' },
    { title: 'Gradients/%/ft/nm\nRate of Climb/Descent', screen: 'ClimbDescent' },
    { title: 'Wind Corrected Headings', screen: 'WindCorrectedHeadings' },
    { title: 'Air Speeds', screen: 'AirSpeeds' },
    { title: 'Altitudes + Heights', screen: 'AltitudesHeights' },
    { title: 'Unit Conversions', screen: 'UnitConversions' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>MAIN</Text>
        {menuItems.map((item, index) => (
          <Button
            key={index}
            title={item.title}
            onPress={() => navigation.navigate(item.screen)}
            style={styles.menuButton}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  menuButton: {
    marginVertical: 6,
    paddingVertical: 16,
  },
});