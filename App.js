// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
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
import colors from './src/constants/colors';

const Stack = createNativeStackNavigator();

SplashScreenExpo.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreenExpo.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary, // Navy blue header
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
          headerBackTitle: '',
        }}
      >
        <Stack.Screen 
          name="MainMenu" 
          component={MainMenuScreen}
          options={{ title: 'PSPACE Toolbox' }}
        />
        <Stack.Screen 
          name="MetarTaf" 
          component={MetarTafScreen}
          options={{ title: 'METAR/TAF' }}
        />
        <Stack.Screen 
          name="WindComponent" 
          component={WindComponentScreen}
          options={{ title: 'Wind Component' }}
        />
        <Stack.Screen 
          name="ClimbDescent" 
          component={ClimbDescentScreen}
          options={{ title: 'Gradient and Rate' }}
        />
        <Stack.Screen 
          name="WindCorrectedHeadings" 
          component={WindCorrectedHeadingsScreen}
          options={{ title: 'Wind Corrected Headings' }}
        />
        <Stack.Screen 
          name="AirSpeeds" 
          component={AirSpeedsScreen}
          options={{ title: 'Air Speeds' }}
        />
        <Stack.Screen 
          name="AltitudesHeights" 
          component={AltitudesHeightsScreen}
          options={{ title: 'Altitudes + Heights' }}
        />
        <Stack.Screen 
          name="UnitConversions" 
          component={UnitConversionsScreen}
          options={{ title: 'Unit Conversions' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}