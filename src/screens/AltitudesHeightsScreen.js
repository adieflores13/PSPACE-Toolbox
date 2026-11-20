import React, { useMemo, useState } from 'react';
import { Screen, Section, FieldRow, Answer, ValueRow, useHeaderReset } from '../components/ui';
import { num, fmtInt } from '../utils/input';
import { calculateAltitudes } from '../utils/calculations';

export default function AltitudesHeightsScreen({ navigation }) {
  const [indicatedAlt, setIndicatedAlt] = useState('');
  const [qnh, setQnh] = useState('');
  const [oat, setOat] = useState('');
  const [elevation, setElevation] = useState('');

  const reset = () => {
    setIndicatedAlt('');
    setQnh('');
    setOat('');
    setElevation('');
  };
  useHeaderReset(navigation, reset, !!(indicatedAlt || qnh || oat || elevation));

  // Empty QNH = 1013, empty OAT = ISA.
  const r = useMemo(() => {
    const altValue = num(indicatedAlt);
    if (altValue === null) return null;
    const qnhIn = num(qnh);
    const elevIn = num(elevation);
    const a = calculateAltitudes(altValue, qnhIn === null ? 1013 : qnhIn, num(oat), elevIn);
    return {
      pressure: Math.round(a.pressure),
      density: Math.round(a.density),
      trueAltitude: Math.round(a.trueAltitude),
      heightAGL: Math.round(a.heightAGL),
      hasElevation: elevIn !== null,
      isaDeviation: Number(a.isaDeviation.toFixed(1)),
    };
  }, [indicatedAlt, qnh, oat, elevation]);

  const dev = r ? r.isaDeviation : 0;
  const devText = `ISA ${dev > 0 ? '+' : dev < 0 ? '−' : '±'}${Math.abs(dev).toFixed(1)}°C`;

  return (
    <Screen>
      <Section>
        <FieldRow label="Altitude" value={indicatedAlt} onChangeText={setIndicatedAlt} placeholder="3500" keyboardType="numbers-and-punctuation" unit="ft" />
        <FieldRow label="QNH" value={qnh} onChangeText={setQnh} placeholder="1013" keyboardType="number-pad" unit="hPa" />
        <FieldRow label="OAT" value={oat} onChangeText={setOat} placeholder="ISA" keyboardType="numbers-and-punctuation" unit="°C" />
        <FieldRow label="Elevation" value={elevation} onChangeText={setElevation} placeholder="0" keyboardType="numbers-and-punctuation" unit="ft" />
      </Section>

      {r ? (
        <Section>
          <Answer
            label="Density altitude"
            value={fmtInt(r.density)}
            unit="ft"
            tone={dev > 0 ? 'warning' : undefined}
            caption={devText}
          />
          <ValueRow label="Pressure altitude" value={fmtInt(r.pressure)} unit="ft" />
          <ValueRow label="True altitude" value={fmtInt(r.trueAltitude)} unit="ft" />
          {r.hasElevation ? <ValueRow label="Height AGL" value={fmtInt(r.heightAGL)} unit="ft" /> : null}
        </Section>
      ) : null}
    </Screen>
  );
}
