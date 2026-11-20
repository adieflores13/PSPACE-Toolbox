// App.js
import React, { useState } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenExpo from 'expo-splash-screen';

import SplashScreen from './src/screens/SplashScreen';
import MainMenuScreen from './src/screens/MainMenuScreen';
import MetarTafScreen from './src/screens/MetarTafScreen';
import WindComponentScreen from './src/screens/WindComponentScreen';
import ClimbDescentScreen from './src/screens/ClimbDescentScreen';
import WindCorrectedHeadingsScreen from './src/screens/WindCorrectedHeadingsScreen';
import AirSpeedsScreen from './src/screens/AirSpeedsScreen';
import AltitudesHeightsScreen from './src/screens/AltitudesHeightsScreen';
import UnitConversionsScreen from './src/screens/UnitConversionsScreen';
import { useTheme } from './src/theme';
import { BackButton } from './src/components/ui';

const Stack = createNativeStackNavigator();

SplashScreenExpo.preventAutoHideAsync().catch(() => {});

export default function App() {
  const t = useTheme();
  // The branded hand-off is white like the native splash; in dark mode skip it
  // so the screen never flashes white.
  const [showSplash, setShowSplash] = useState(t.scheme !== 'dark');

  React.useEffect(() => {
    SplashScreenExpo.hideAsync().catch(() => {});
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: t.tint,
      background: t.background,
      card: t.background,
      text: t.label,
      border: t.separator,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={({ navigation, route }) => ({
          headerStyle: { backgroundColor: t.background },
          headerTintColor: t.tint,
          headerTitleStyle: { color: t.label, fontWeight: '600' },
          headerShadowVisible: false,
          headerBackVisible: false,
          // Plain chevron back on every platform (no arrow with a tail).
          headerLeft: route.name === 'MainMenu' ? undefined : () => <BackButton onPress={navigation.goBack} />,
          contentStyle: { backgroundColor: t.background },
        })}
      >
        <Stack.Screen
          name="MainMenu"
          component={MainMenuScreen}
          options={{
            title: 'PSPACE Toolbox',
            headerLargeTitle: true,
            headerLargeTitleShadowVisible: false,
            headerLargeStyle: { backgroundColor: t.background },
            headerLargeTitleStyle: { color: t.label },
            headerTitleStyle: { color: t.label, fontWeight: Platform.OS === 'android' ? '700' : '600' },
          }}
        />
        <Stack.Screen name="MetarTaf" component={MetarTafScreen} options={{ title: 'METAR / TAF' }} />
        <Stack.Screen name="WindComponent" component={WindComponentScreen} options={{ title: 'Wind Component' }} />
        <Stack.Screen name="ClimbDescent" component={ClimbDescentScreen} options={{ title: 'Gradient and Rate' }} />
        <Stack.Screen name="WindCorrectedHeadings" component={WindCorrectedHeadingsScreen} options={{ title: 'Wind Corrected Heading' }} />
        <Stack.Screen name="AirSpeeds" component={AirSpeedsScreen} options={{ title: 'Air Speeds' }} />
        <Stack.Screen name="AltitudesHeights" component={AltitudesHeightsScreen} options={{ title: 'Altitudes' }} />
        <Stack.Screen name="UnitConversions" component={UnitConversionsScreen} options={{ title: 'Unit Conversions' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
