import React, { useMemo, useState } from 'react';
import { Screen, Section, FieldRow, Answer, useHeaderReset } from '../components/ui';
import { convertGradient, calculateRateOfClimbDescent } from '../utils/calculations';
import { num, fmtInt } from '../utils/input';

const UNIT_KEY = { deg: 'degrees', pct: 'percent', ftNm: 'ftPerNm' };

export default function ClimbDescentScreen({ navigation }) {
  // The field the pilot typed in drives the other two.
  const [source, setSource] = useState({ field: null, text: '' });
  const [groundSpeed, setGroundSpeed] = useState('');

  const reset = () => {
    setSource({ field: null, text: '' });
    setGroundSpeed('');
  };
  useHeaderReset(navigation, reset, !!(source.text || groundSpeed));

  const converted = useMemo(() => {
    if (!source.field || num(source.text) === null) return null;
    return convertGradient(num(source.text), UNIT_KEY[source.field]);
  }, [source]);

  const valueFor = (field, key) => {
    if (source.field === field) return source.text;
    return converted ? converted[key] : '';
  };
  const edit = (field) => (text) => setSource({ field, text });

  const rate = useMemo(() => {
    const gs = num(groundSpeed);
    if (!converted || gs === null) return null;
    return calculateRateOfClimbDescent(converted.ftPerNm, gs);
  }, [converted, groundSpeed]);

  return (
    <Screen>
      <Section>
        <FieldRow label="Angle" value={valueFor('deg', 'degrees')} onChangeText={edit('deg')} placeholder="3.00" unit="°" />
        <FieldRow label="Percent" value={valueFor('pct', 'percent')} onChangeText={edit('pct')} placeholder="5.24" unit="%" />
        <FieldRow label="ft / NM" value={valueFor('ftNm', 'ftPerNm')} onChangeText={edit('ftNm')} placeholder="318" />
      </Section>

      <Section>
        <FieldRow label="Ground speed" value={groundSpeed} onChangeText={setGroundSpeed} placeholder="90" keyboardType="number-pad" unit="kt" />
        {rate !== null ? <Answer label="Rate" value={fmtInt(rate)} unit="ft/min" /> : null}
      </Section>
    </Screen>
  );
}
