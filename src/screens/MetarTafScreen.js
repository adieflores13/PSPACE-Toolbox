import React, { useState } from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import { Screen, Section, FieldRow, PrimaryButton, Notice, useHeaderReset } from '../components/ui';
import { getMetarTaf, isIcaoCode, formatAge, tafLines, METAR_STALE_MS, TAF_STALE_MS } from '../utils/metarApi';
import { useTheme, type, space, monoFamily } from '../theme';

function Report({ label, text, lines, time, staleAfter }) {
  const t = useTheme();
  const age = formatAge(time);
  const stale = time && Date.now() - time > staleAfter;
  return (
    <View style={styles.report}>
      <View style={styles.reportHead}>
        <Text style={[type.footnote, styles.reportLabel, { color: t.secondaryLabel }]}>{label}</Text>
        {age ? (
          <Text style={[type.footnote, { color: stale ? t.warning : t.secondaryLabel, fontWeight: stale ? '700' : '400' }]}>
            {stale ? `Old · ${age}` : age}
          </Text>
        ) : null}
      </View>
      {(lines || [text]).map((line, i) => (
        <Text
          key={i}
          selectable
          style={[styles.raw, { color: t.label, paddingLeft: i > 0 ? space.l : 0 }]}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}

export default function MetarTafScreen({ navigation }) {
  const [airport, setAirport] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const reset = () => {
    setAirport('');
    setResults([]);
    setError(null);
  };
  useHeaderReset(navigation, reset, !!(airport || results.length || error));

  const handleGetWeather = async () => {
    Keyboard.dismiss();
    if (!airport.trim()) {
      setError({ tone: 'danger', text: 'Enter an ICAO code, e.g. RPLL.' });
      return;
    }

    const uniqueAirports = [...new Set(airport.toUpperCase().trim().split(/[\s,]+/))];
    const notCodes = uniqueAirports.filter((c) => !isIcaoCode(c));
    if (notCodes.length) {
      setError({ tone: 'danger', text: `${notCodes.join(', ')}: use 4-character ICAO codes, e.g. RPLL.` });
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    const fetched = [];
    const failed = [];
    for (const code of uniqueAirports) {
      const data = await getMetarTaf(code);
      if (data.success) fetched.push(data);
      else failed.push(code);
    }

    setLoading(false);
    setResults(fetched);
    if (failed.length) {
      setError(
        failed.length === uniqueAirports.length
          ? { tone: 'danger', text: `No reports for ${failed.join(', ')}. Check the code or your connection.` }
          : { tone: 'warning', text: `No reports for ${failed.join(', ')}.` }
      );
    }
  };

  return (
    <Screen>
      <Section>
        <FieldRow
          label="Airports"
          value={airport}
          onChangeText={setAirport}
          placeholder="RPLL RPVM"
          keyboardType="default"
          autoCapitalize="characters"
          wide
          returnKeyType="search"
          onSubmitEditing={handleGetWeather}
        />
      </Section>
      <PrimaryButton title="Get weather" onPress={handleGetWeather} loading={loading} />

      {error ? <Notice tone={error.tone} title={error.title} text={error.text} /> : null}

      {results.map((r) => (
        <Section key={r.airport} title={r.airport}>
          <Report label="METAR" text={r.metar} time={r.metarTime} staleAfter={METAR_STALE_MS} />
          <Report label="TAF" text={r.taf} lines={tafLines(r.taf)} time={r.tafTime} staleAfter={TAF_STALE_MS} />
        </Section>
      ))}

    </Screen>
  );
}

const styles = StyleSheet.create({
  report: { padding: space.l, gap: 2 },
  reportHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  reportLabel: { fontWeight: '700', letterSpacing: 0.4 },
  raw: { fontFamily: monoFamily, fontSize: 14, lineHeight: 21 },
});
