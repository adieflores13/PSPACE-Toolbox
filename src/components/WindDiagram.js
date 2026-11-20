import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme, type, tabular, hairline } from '../theme';

// Compass rose drawn with views: every element is a full-size layer rotated about the centre.
function Layer({ size, deg, children }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', transform: [{ rotate: `${deg}deg` }] }]}>
      {children}
    </View>
  );
}

function Ticks({ size, color }) {
  return Array.from({ length: 36 }, (_, i) => {
    const major = i % 9 === 0;
    const mid = i % 3 === 0;
    return (
      <Layer key={i} size={size} deg={i * 10}>
        <View style={{ width: major ? 2 : 1, height: major ? 12 : mid ? 9 : 5, backgroundColor: color, marginTop: 3, opacity: major ? 1 : 0.7 }} />
      </Layer>
    );
  });
}

function Cardinal({ size, label, deg, color }) {
  const r = size / 2 - 26;
  const rad = (deg * Math.PI) / 180;
  return (
    <Text
      style={[type.caption, styles.cardinal, { color, left: size / 2 + r * Math.sin(rad) - 10, top: size / 2 - r * Math.cos(rad) - 8 }]}
    >
      {label}
    </Text>
  );
}

// An arrow that starts at the rim and points at the centre, along `deg` (where something comes FROM).
function InboundArrow({ size, deg, color, length, width = 3 }) {
  const head = 12;
  return (
    <Layer size={size} deg={deg}>
      <View style={{ alignItems: 'center', marginTop: 42 }}>
        <View style={{ width, height: length - head, backgroundColor: color, borderRadius: width / 2 }} />
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: head * 0.6,
            borderRightWidth: head * 0.6,
            borderTopWidth: head,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: color,
          }}
        />
      </View>
    </Layer>
  );
}

// An arrow from the centre out toward `deg` (where something is going TO).
function OutboundArrow({ size, deg, color, length, width = 3 }) {
  const head = 12;
  return (
    <Layer size={size} deg={deg}>
      <View style={{ alignItems: 'center', marginTop: size / 2 - length }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: head * 0.6,
            borderRightWidth: head * 0.6,
            borderBottomWidth: head,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
          }}
        />
        <View style={{ width, height: length - head, backgroundColor: color, borderRadius: width / 2 }} />
      </View>
    </Layer>
  );
}

function Frame({ children, size, legend }) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <View
        style={[styles.dial, { width: size, height: size, borderRadius: size / 2, backgroundColor: t.diagramGround, borderColor: t.separator }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ticks size={size} color={t.tertiaryLabel} />
        <Cardinal size={size} label="N" deg={0} color={t.label} />
        <Cardinal size={size} label="E" deg={90} color={t.secondaryLabel} />
        <Cardinal size={size} label="S" deg={180} color={t.secondaryLabel} />
        <Cardinal size={size} label="W" deg={270} color={t.secondaryLabel} />
        {children}
        <View style={[styles.hub, { backgroundColor: t.label, left: size / 2 - 3, top: size / 2 - 3 }]} />
      </View>
      {legend ? <View style={styles.legend}>
        {legend.map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: l.color }]} />
            <Text style={[type.footnote, tabular, { color: t.secondaryLabel }]}>{l.label}</Text>
          </View>
        ))}
      </View> : null}
    </View>
  );
}

function useDialSize() {
  const { width } = useWindowDimensions();
  return Math.round(Math.min(width - 32 - 48, 300));
}

export function RunwayWindDiagram({ runway, windDir, windSpeed }) {
  const t = useTheme();
  const size = useDialSize();
  const hdg = parseInt(runway, 10) * 10;
  const rwyW = Math.round(size * 0.14);
  const rwyL = Math.round(size * 0.6);
  const recip = (((parseInt(runway, 10) + 18 - 1) % 36) + 1).toString().padStart(2, '0');
  return (
    <Frame size={size}>
      <Layer size={size} deg={hdg}>
        <View style={{ marginTop: (size - rwyL) / 2, width: rwyW, height: rwyL, backgroundColor: t.runway, borderRadius: 3, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
          <Text style={[styles.rwyNum, { color: t.onRunway, transform: [{ rotate: '180deg' }] }]}>{recip}</Text>
          <View style={{ flex: 1, justifyContent: 'space-evenly', paddingVertical: 4 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={{ width: 2, height: rwyL * 0.06, backgroundColor: t.onRunway, opacity: 0.85 }} />
            ))}
          </View>
          <Text style={[styles.rwyNum, { color: t.onRunway }]}>{runway}</Text>
        </View>
      </Layer>
      <InboundArrow size={size} deg={windDir} color={t.accent} length={size * 0.34} width={4} />
    </Frame>
  );
}

export function TriangleDiagram({ track, heading, windDir, windSpeed, trackColor, headingColor }) {
  const t = useTheme();
  const size = useDialSize();
  const len = size / 2 - 44;
  return (
    <Frame
      size={size}
      legend={[
        { label: 'Track', color: trackColor },
        { label: 'Heading', color: headingColor },
        { label: 'Wind', color: t.accent },
      ]}
    >
      <OutboundArrow size={size} deg={track} color={trackColor} length={len} width={2} />
      <OutboundArrow size={size} deg={heading} color={headingColor} length={len * 0.82} width={4} />
      <InboundArrow size={size} deg={windDir} color={t.accent} length={size * 0.24} width={3} />
    </Frame>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 20, gap: 14 },
  dial: { borderWidth: hairline, overflow: 'hidden' },
  cardinal: { position: 'absolute', width: 20, textAlign: 'center', fontWeight: '700' },
  hub: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  rwyNum: { fontSize: 15, fontWeight: '800', ...tabular },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16, rowGap: 6, paddingHorizontal: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 4, borderRadius: 2 },
});
