import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Platform, ActivityIndicator, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type, tabular, space, radius, hairline } from '../theme';

/* ---------- Layout ---------- */

export function Screen({ children, contentStyle }) {
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.background }}
      contentContainerStyle={[styles.screenContent, contentStyle]}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
    >
      {children}
    </ScrollView>
  );
}

export function Section({ title, footer, children, style, flush, inset }) {
  const t = useTheme();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.section, style]}>
      {title ? (
        <Text style={[type.footnote, styles.sectionTitle, { color: t.secondaryLabel }]} accessibilityRole="header">
          {title.toUpperCase()}
        </Text>
      ) : null}
      <View style={[styles.group, { backgroundColor: t.surface }]}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 && !flush ? (
              <View style={[styles.separator, { backgroundColor: t.separator }, inset ? { marginLeft: inset } : null]} />
            ) : null}
            {child}
          </View>
        ))}
      </View>
      {footer ? (
        <Text style={[type.footnote, styles.sectionFooter, { color: t.secondaryLabel }]}>{footer}</Text>
      ) : null}
    </View>
  );
}

/* ---------- Inputs ---------- */

export function FieldRow({ label, value, onChangeText, unit, placeholder, keyboardType = 'decimal-pad', autoCapitalize = 'none', invalid, onFocus, onSubmitEditing, returnKeyType = 'done', accessibilityHint, wide }) {
  const t = useTheme();
  const ref = useRef(null);
  return (
    <Pressable
      onPress={() => ref.current?.focus()}
      style={styles.fieldRow}
      accessible={false}
    >
      <Text style={[type.body, styles.fieldLabel, { color: t.label }]} numberOfLines={2}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        style={[type.body, tabular, styles.fieldInput, wide && styles.fieldInputWide, { color: invalid ? t.danger : t.label }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.tertiaryLabel}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        selectionColor={t.tint}
        cursorColor={t.tint}
        returnKeyType={returnKeyType}
        onFocus={onFocus}
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={unit ? `${label}, ${unit}` : label}
        accessibilityHint={accessibilityHint}
      />
      {unit ? (
        <Text style={[type.body, styles.fieldUnit, { color: t.secondaryLabel }]} numberOfLines={1}>{unit}</Text>
      ) : null}
    </Pressable>
  );
}

export function SwitchRow({ label, value, onValueChange, children }) {
  const t = useTheme();
  return (
    <View style={styles.fieldRow}>
      <Text style={[type.body, { flex: 1, color: t.label }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: t.fill, true: t.primary }}
        thumbColor={Platform.OS === 'android' ? (value ? t.onPrimary : '#F4F5F7') : undefined}
        ios_backgroundColor={t.fill}
        accessibilityLabel={label}
      />
    </View>
  );
}

export function Segmented({ options, value, onChange, style }) {
  const t = useTheme();
  return (
    <View style={[styles.segTrack, { backgroundColor: t.fill }, style]} accessibilityRole="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            hitSlop={{ top: 6, bottom: 6 }}
            style={[styles.segItem, active && [styles.segActive, { backgroundColor: t.segActive }]]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[type.subhead, { color: t.label, fontWeight: active ? '600' : '500' }]} numberOfLines={1}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chips({ options, value, onChange }) {
  const t = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.chip,
              { backgroundColor: active ? t.primary : t.surface, borderColor: active ? t.primary : t.separator },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[type.subhead, { color: active ? t.onPrimary : t.label, fontWeight: '600' }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ---------- Actions ---------- */

export function PrimaryButton({ title, onPress, loading, disabled, icon }) {
  const t = useTheme();
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: t.primary, opacity: off ? 0.45 : pressed ? 0.85 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: !!loading }}
    >
      {loading ? (
        <ActivityIndicator color={t.onPrimary} />
      ) : (
        <View style={styles.primaryInner}>
          {icon ? <Ionicons name={icon} size={18} color={t.onPrimary} /> : null}
          <Text style={[type.headline, { color: t.onPrimary }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function HeaderButton({ title, onPress, disabled }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={12}
      style={({ pressed }) => ({ opacity: disabled ? 0.35 : pressed ? 0.5 : 1, paddingHorizontal: Platform.OS === 'ios' ? 0 : 8, marginRight: Platform.OS === 'web' ? 8 : 0 })}
      accessibilityRole="button"
    >
      <Text style={[type.body, { color: t.tint, fontWeight: Platform.OS === 'android' ? '600' : '400' }]}>{title}</Text>
    </Pressable>
  );
}

export function BackButton({ onPress }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginLeft: Platform.OS === 'ios' ? -8 : 0, marginRight: Platform.OS === 'ios' ? 0 : 12, minWidth: 32, minHeight: 32, justifyContent: 'center' })}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <Ionicons name="chevron-back" size={28} color={t.tint} />
    </Pressable>
  );
}

// Puts a "Clear" action in the header while the screen has something to clear.
export function useHeaderReset(navigation, onReset, enabled) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderButton title="Clear" onPress={onReset} disabled={!enabled} />,
    });
  }, [navigation, enabled]);
}

export function NavRow({ icon, title, subtitle, onPress }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: t.surfacePressed }]}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
    >
      <View style={[styles.tile, { backgroundColor: t.tile }]}>
        <MaterialCommunityIcons name={icon} size={19} color={t.onTile} />
      </View>
      <View style={styles.navText}>
        <Text style={[type.body, { color: t.label }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[type.footnote, { color: t.secondaryLabel }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={t.tertiaryLabel} />
    </Pressable>
  );
}

/* ---------- Results ---------- */

// The answer: the largest thing on every tool screen.
export function Answer({ label, value, unit, caption, tone, children }) {
  const t = useTheme();
  const color = tone === 'danger' ? t.danger : tone === 'warning' ? t.warning : t.label;
  return (
    <View style={styles.answer} accessible accessibilityLabel={`${label} ${value} ${unit || ''}. ${caption || ''}`}>
      <Text style={[type.subhead, { color: t.secondaryLabel, fontWeight: '600' }]}>{label}</Text>
      <View style={styles.answerLine}>
        <Text style={[type.answer, tabular, { color }]} adjustsFontSizeToFit numberOfLines={1}>{value}</Text>
        {unit ? <Text style={[type.title2, { color: t.secondaryLabel, fontWeight: '600' }]}>{unit}</Text> : null}
      </View>
      {caption ? <Text style={[type.footnote, tabular, { color: t.secondaryLabel }]}>{caption}</Text> : null}
      {children}
    </View>
  );
}

// Two answers side by side (e.g. headwind + crosswind).
export function AnswerPair({ items }) {
  const t = useTheme();
  return (
    <View style={styles.pair}>
      {items.map((it, i) => (
        <View
          key={it.label}
          style={[styles.pairItem, i > 0 && { borderLeftWidth: hairline, borderLeftColor: t.separator, paddingLeft: space.l }]}
          accessible
          accessibilityLabel={`${it.label} ${it.value} ${it.unit || ''}. ${it.caption || ''}`}
        >
          <Text style={[type.subhead, { color: t.secondaryLabel, fontWeight: '600' }]} numberOfLines={1}>{it.label}</Text>
          <View style={styles.answerLine}>
            <Text style={[styles.pairValue, tabular, { color: it.tone === 'warning' ? t.warning : t.label }]} adjustsFontSizeToFit numberOfLines={1}>
              {it.value}
            </Text>
            {it.unit ? <Text style={[type.headline, { color: t.secondaryLabel }]}>{it.unit}</Text> : null}
          </View>
          {it.caption ? <Text style={[type.footnote, { color: t.secondaryLabel }]} numberOfLines={2}>{it.caption}</Text> : null}
        </View>
      ))}
    </View>
  );
}

export function ValueRow({ label, value, unit, note, tone }) {
  const t = useTheme();
  const color = tone === 'danger' ? t.danger : tone === 'warning' ? t.warning : tone === 'positive' ? t.positive : t.label;
  return (
    <View style={styles.valueRow} accessible accessibilityLabel={`${label} ${value} ${unit || ''}`}>
      <View style={{ flex: 1, paddingRight: space.m }}>
        <Text style={[type.body, { color: t.label }]}>{label}</Text>
        {note ? <Text style={[type.footnote, { color: t.secondaryLabel, marginTop: 2 }]}>{note}</Text> : null}
      </View>
      <Text style={[type.figure, tabular, { color }]}>
        {value}
        {unit ? <Text style={[type.callout, { color: t.secondaryLabel, fontWeight: '500' }]}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

export function Placeholder({ icon = 'calculator-outline', text }) {
  const t = useTheme();
  return (
    <View style={styles.placeholder}>
      <Ionicons name={icon} size={22} color={t.tertiaryLabel} />
      <Text style={[type.subhead, { color: t.secondaryLabel, flex: 1 }]}>{text}</Text>
    </View>
  );
}

export function Notice({ tone = 'danger', title, text }) {
  const t = useTheme();
  const fg = tone === 'warning' ? t.warning : t.danger;
  const bg = tone === 'warning' ? t.warningFill : t.dangerFill;
  return (
    <View style={[styles.notice, { backgroundColor: bg }]} accessibilityRole="alert">
      <Ionicons name={tone === 'warning' ? 'warning-outline' : 'alert-circle-outline'} size={20} color={fg} />
      <View style={{ flex: 1 }}>
        {title ? <Text style={[type.subhead, { color: fg, fontWeight: '600' }]}>{title}</Text> : null}
        <Text style={[type.subhead, { color: fg }]}>{text}</Text>
      </View>
    </View>
  );
}

export function InlineHint({ text, tone }) {
  const t = useTheme();
  return (
    <Text style={[type.footnote, styles.inlineHint, { color: tone === 'danger' ? t.danger : t.secondaryLabel }]}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: space.xxl * 2, paddingTop: space.s },
  section: { marginTop: space.xl, marginHorizontal: space.l },
  sectionTitle: { marginLeft: space.l, marginBottom: 6, letterSpacing: 0.2 },
  sectionFooter: { marginHorizontal: space.l, marginTop: 6 },
  group: { borderRadius: radius.cell, overflow: 'hidden' },
  separator: { height: hairline, marginLeft: space.l },
  fieldRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.l, gap: space.s },
  fieldLabel: { flex: 1, paddingVertical: space.m },
  fieldInput: { width: 108, flexShrink: 1, textAlign: 'right', paddingVertical: space.m, paddingHorizontal: 0 },
  fieldInputWide: { width: undefined, flex: 3 },
  fieldUnit: { minWidth: 24 },
  segTrack: { flexDirection: 'row', borderRadius: radius.control, padding: 3 },
  segItem: { flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.control - 3, paddingHorizontal: space.s },
  segActive: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  chips: { gap: space.s, paddingHorizontal: space.l },
  chip: { minHeight: 44, paddingHorizontal: space.l, borderRadius: 20, borderWidth: 1, justifyContent: 'center' },
  primary: { minHeight: 50, borderRadius: radius.cell, alignItems: 'center', justifyContent: 'center', marginHorizontal: space.l, marginTop: space.xl },
  primaryInner: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  navRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.l, gap: space.m },
  tile: { width: 30, height: 30, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
  navText: { flex: 1, gap: 1 },
  answer: { padding: space.l, paddingTop: space.m + 2, gap: 2 },
  answerLine: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  pair: { flexDirection: 'row', padding: space.l, paddingTop: space.m + 2 },
  pairItem: { flex: 1, gap: 2 },
  pairValue: { fontSize: 40, lineHeight: 46, fontWeight: '700', letterSpacing: -0.5 },
  valueRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.l, paddingVertical: space.m },
  placeholder: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.l },
  notice: { flexDirection: 'row', gap: space.m, padding: space.l, borderRadius: radius.cell, marginHorizontal: space.l, marginTop: space.l, alignItems: 'flex-start' },
  inlineHint: { marginHorizontal: space.xxl, marginTop: 6 },
});
