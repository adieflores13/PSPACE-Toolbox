import React, { useMemo, useState } from 'react';
import { Screen, Section, FieldRow, AnswerPair, InlineHint, useHeaderReset } from '../components/ui';
import { RunwayWindDiagram } from '../components/WindDiagram';
import { calculateWindComponent } from '../utils/calculations';
import { parseWind } from '../utils/input';

export default function WindComponentScreen({ navigation }) {
  const [runway, setRunway] = useState('');
  const [wind, setWind] = useState('');

  const reset = () => {
    setRunway('');
    setWind('');
  };
  useHeaderReset(navigation, reset, !!(runway || wind));

  const { result, error } = useMemo(() => {
    const rwyText = runway.trim().toUpperCase();
    const runwayNum = parseInt(rwyText, 10);
    const runwayOk = /^\d{1,2}[LRC]?$/.test(rwyText) && runwayNum >= 1 && runwayNum <= 36;
    const w = parseWind(wind);
    if (rwyText && !runwayOk) return { error: 'Runway 01–36' };
    if (wind.trim() && w.error) return { error: w.error };
    if (!runwayOk || !w.ok) return {};

    const formattedRunway = runwayNum.toString().padStart(2, '0');
    const calculated = calculateWindComponent(formattedRunway, w.dir, w.speed);

    let relativeAngle = parseInt(w.dir, 10) - runwayNum * 10;
    if (relativeAngle > 180) relativeAngle -= 360;
    if (relativeAngle < -180) relativeAngle += 360;

    return {
      result: {
        ...calculated,
        runway: formattedRunway,
        windDir: parseInt(w.dir, 10),
        windSpeed: parseInt(w.speed, 10),
        crosswindSide: relativeAngle > 0 ? 'Right' : 'Left',
      },
    };
  }, [runway, wind]);

  const r = result;
  return (
    <Screen>
      <Section>
        <FieldRow label="Runway" value={runway} onChangeText={setRunway} placeholder="27" keyboardType="number-pad" invalid={error === 'Runway 01–36'} />
        <FieldRow label="Wind" value={wind} onChangeText={setWind} placeholder="240/18" keyboardType="numbers-and-punctuation" unit="kt" />
      </Section>
      {error ? <InlineHint tone="danger" text={error} /> : null}

      {r ? (
        <Section>
          <AnswerPair
            items={[
              {
                label: r.isHeadwind ? 'Headwind' : 'Tailwind',
                value: Math.abs(r.headwind),
                unit: 'kt',
                tone: r.isHeadwind ? undefined : 'warning',
              },
              {
                label: r.crosswind === 0 ? 'Crosswind' : `Crosswind ${r.crosswindSide}`,
                value: r.crosswind,
                unit: 'kt',
              },
            ]}
          />
          <RunwayWindDiagram runway={r.runway} windDir={r.windDir} windSpeed={r.windSpeed} />
        </Section>
      ) : null}
    </Screen>
  );
}
