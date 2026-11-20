import React, { useMemo, useState } from 'react';
import { Screen, Section, FieldRow, SwitchRow, Answer, ValueRow, InlineHint, useHeaderReset } from '../components/ui';
import { num, fmtInt } from '../utils/input';
import { calculatePressureAltitude, isaTemperature, calculateTAS, calculateMach, calculateGroundSpeed } from '../utils/calculations';

export default function AirSpeedsScreen({ navigation }) {
  const [ias, setIas] = useState('');
  const [altitude, setAltitude] = useState('');
  const [qnh, setQnh] = useState('1013');
  const [oat, setOat] = useState('');
  const [includeWind, setIncludeWind] = useState(false);
  const [heading, setHeading] = useState('');
  const [windDirection, setWindDirection] = useState('');
  const [windSpeed, setWindSpeed] = useState('');

  const reset = () => {
    setIas('');
    setAltitude('');
    setQnh('1013');
    setOat('');
    setIncludeWind(false);
    setHeading('');
    setWindDirection('');
    setWindSpeed('');
  };
  useHeaderReset(navigation, reset, !!(ias || altitude || oat || qnh !== '1013' || includeWind));

  const calc = useMemo(() => {
    const iasV = num(ias);
    const altV = num(altitude);
    const qnhV = num(qnh);
    if (iasV === null || altV === null || qnhV === null) return { result: null };

    const pressureAlt = calculatePressureAltitude(altV, qnhV);
    const oatV = num(oat);
    const isa = isaTemperature(pressureAlt);
    const oatValue = oatV === null ? isa : oatV;
    if (oatValue <= -273.15) return { result: null, error: 'OAT is below absolute zero.' };

    const cas = iasV;
    const tas = calculateTAS(cas, pressureAlt, oatValue);
    const mach = calculateMach(tas, oatValue);
    if (!Number.isFinite(tas)) return { result: null, error: 'Altitude is out of range for this calculation.' };

    let groundSpeed = null;
    const hdgV = num(heading);
    const wdV = num(windDirection);
    const wsV = num(windSpeed);
    if (includeWind && hdgV !== null && wdV !== null && wsV !== null) {
      groundSpeed = calculateGroundSpeed(tas, hdgV, wdV, wsV);
    }

    return {
      result: {
        ias: Math.round(iasV),
        cas: Math.round(cas),
        tas: Math.round(tas),
        mach: mach.toFixed(3),
        groundSpeed: groundSpeed !== null ? Math.round(groundSpeed) : null,
        pressureAlt: Math.round(pressureAlt),
        oat: oatValue.toFixed(1),
        oatAssumed: oatV === null,
      },
    };
  }, [ias, altitude, qnh, oat, includeWind, heading, windDirection, windSpeed]);

  const r = calc.result;
  return (
    <Screen>
      <Section>
        <FieldRow label="IAS" value={ias} onChangeText={setIas} placeholder="120" keyboardType="number-pad" unit="kt" />
        <FieldRow label="Altitude" value={altitude} onChangeText={setAltitude} placeholder="5500" keyboardType="number-pad" unit="ft" />
        <FieldRow label="QNH" value={qnh} onChangeText={setQnh} placeholder="1013" keyboardType="number-pad" unit="hPa" />
        <FieldRow label="OAT" value={oat} onChangeText={setOat} placeholder="ISA" keyboardType="numbers-and-punctuation" unit="°C" />
      </Section>

      <Section>
        <SwitchRow label="Ground speed" value={includeWind} onValueChange={setIncludeWind} />
        {includeWind ? <FieldRow label="Heading" value={heading} onChangeText={setHeading} placeholder="090" keyboardType="number-pad" unit="°" /> : null}
        {includeWind ? <FieldRow label="Wind dir" value={windDirection} onChangeText={setWindDirection} placeholder="240" keyboardType="number-pad" unit="°" /> : null}
        {includeWind ? <FieldRow label="Wind speed" value={windSpeed} onChangeText={setWindSpeed} placeholder="18" keyboardType="number-pad" unit="kt" /> : null}
      </Section>
      {calc.error ? <InlineHint tone="danger" text={calc.error} /> : null}

      {r ? (
        <Section>
          <Answer label="True airspeed" value={r.tas} unit="kt" caption={`PA ${fmtInt(r.pressureAlt)} ft`} />
          <ValueRow label="Mach" value={r.mach} />
          {includeWind ? <ValueRow label="Ground speed" value={r.groundSpeed !== null ? r.groundSpeed : '—'} unit={r.groundSpeed !== null ? 'kt' : ''} /> : null}
        </Section>
      ) : null}
    </Screen>
  );
}
