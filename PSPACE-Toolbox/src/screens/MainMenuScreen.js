import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../components/Button';
import colors from '../constants/colors';

export default function MainMenuScreen({ navigation }) {
  const menuItems = [
    { title: 'METAR/TAF', screen: 'MetarTaf' },
    { title: 'Wind Component', screen: 'WindComponent' },
    { title: 'Gradient and Rate', screen: 'ClimbDescent' },
    { title: 'Wind Corrected Headings', screen: 'WindCorrectedHeadings' },
    { title: 'Air Speeds', screen: 'AirSpeeds' },
    { title: 'Altitudes + Heights', screen: 'AltitudesHeights' },
    { title: 'Unit Conversions', screen: 'UnitConversions' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
    paddingTop: 10,
  },
  menuButton: {
    marginVertical: 6,
    paddingVertical: 16,
  },
});