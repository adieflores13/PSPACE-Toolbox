import React from 'react';
import { Screen, Section, NavRow } from '../components/ui';

// Most-used tools first; the rest in a second group. No extra copy.
const GROUPS = [
  [
    { title: 'METAR / TAF', screen: 'MetarTaf', icon: 'weather-partly-cloudy' },
    { title: 'Wind Component', screen: 'WindComponent', icon: 'weather-windy' },
    { title: 'Wind Corrected Heading', screen: 'WindCorrectedHeadings', icon: 'compass-outline' },
    { title: 'Altitudes', screen: 'AltitudesHeights', icon: 'altimeter' },
    { title: 'Air Speeds', screen: 'AirSpeeds', icon: 'speedometer' },
  ],
  [
    { title: 'Gradient and Rate', screen: 'ClimbDescent', icon: 'slope-uphill' },
    { title: 'Unit Conversions', screen: 'UnitConversions', icon: 'swap-horizontal' },
  ],
];

export default function MainMenuScreen({ navigation }) {
  return (
    <Screen>
      {GROUPS.map((items, i) => (
        <Section key={i} inset={58}>
          {items.map((item) => (
            <NavRow key={item.screen} icon={item.icon} title={item.title} onPress={() => navigation.navigate(item.screen)} />
          ))}
        </Section>
      ))}

    </Screen>
  );
}

