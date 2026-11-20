import React, { useMemo, useState } from 'react';
import { Screen, Section, FieldRow, Answer, ValueRow, InlineHint, Notice, useHeaderReset } from '../components/ui';
import { TriangleDiagram } from '../components/WindDiagram';
import { calculateWindCorrectedHeading } from '../utils/calculations';
import { parseWind, num, pad3 } from '../utils/input';
import { useTheme } from '../theme';

export default function WindCorrectedHeadingsScreen({ navigation }) {
  const t = useTheme();
  const [track, setTrack] = useState('');
  const [tas, setTas] = useState('');
  const [wind, setWind] = useState('');

  const reset = () => {
    setTrack('');
    setTas('');
    setWind('');
  };
  useHeaderReset(navigation, reset, !!(track || tas || wind));

  const calc = useMemo(() => {
    const trk = num(track);
    const spd = num(tas);
    const w = parseWind(wind);
    if (track.trim() && (trk === null || trk < 0 || trk > 360)) return { error: 'Track 000–360' };
    if (tas.trim() && (spd === null || spd <= 0)) return { error: 'TAS must be above 0' };
    if (wind.trim() && w.error) return { error: w.error };
    if (trk === null || spd === null || !w.ok) return {};

    const c = calculateWindCorrectedHeading(track, tas, w.dir, w.speed);
    if (!Number.isFinite(c.heading) || !Number.isFinite(c.drift) || c.groundSpeed <= 0) return { impossible: true };
    return { result: { ...c, track: trk, windDir: parseInt(w.dir, 10), windSpeed: parseInt(w.speed, 10) } };
  }, [track, tas, wind]);

  const r = calc.result;
  const side = r && r.drift !== 0 ? (r.drift > 0 ? 'R' : 'L') : '';

  return (
    <Screen>
      <Section>
        <FieldRow label="Track" value={track} onChangeText={setTrack} placeholder="090" keyboardType="number-pad" unit="°" />
        <FieldRow label="TAS" value={tas} onChangeText={setTas} placeholder="110" keyboardType="number-pad" unit="kt" />
        <FieldRow label="Wind" value={wind} onChangeText={setWind} placeholder="360/20" keyboardType="numbers-and-punctuation" unit="kt" />
      </Section>
      {calc.error ? <InlineHint tone="danger" text={calc.error} /> : null}
      {calc.impossible ? <Notice text="Wind is too strong for this TAS — no heading makes progress along this track." /> : null}

      {r ? (
        <Section>
          <Answer label="Heading" value={`${pad3(r.heading)}°`} />
          <ValueRow label="Ground speed" value={r.groundSpeed} unit="kt" />
          <ValueRow label="Correction" value={`${Math.abs(r.drift).toFixed(1)}°`} unit={side} />
          <TriangleDiagram
            track={r.track}
            heading={r.heading}
            windDir={r.windDir}
            windSpeed={r.windSpeed}
            trackColor={t.tertiaryLabel}
            headingColor={t.label}
          />
        </Section>
      ) : null}
    </Screen>
  );
}
