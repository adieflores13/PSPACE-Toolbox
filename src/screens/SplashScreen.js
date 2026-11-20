import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing, AccessibilityInfo, useWindowDimensions } from 'react-native';

// Brief branded hand-off from the native splash (same white ground, same logo),
// then straight to the toolbox. Reduce Motion skips the movement.
export default function SplashScreen({ onFinish }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const size = Math.min(width * 0.8, 340);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        const out = reduce
          ? Animated.timing(opacity, { toValue: 0, duration: 200, delay: 300, useNativeDriver: true })
          : Animated.parallel([
              Animated.timing(opacity, { toValue: 0, duration: 280, delay: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.timing(scale, { toValue: 1.04, duration: 280, delay: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]);
        out.start(() => !cancelled && onFinish());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: size, height: size * 1.43 }}
          resizeMode="contain"
          accessibilityLabel="PSPACE Toolbox"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
