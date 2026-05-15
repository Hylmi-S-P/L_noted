import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { Transaction } from '../../types/domain';

type ScreenProps = {
  children: React.ReactNode;
  bottomInset?: number;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

export function Screen({ children, bottomInset = 24, refreshControl }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.screenContent,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + bottomInset },
      ]}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

type TopBarProps = {
  title?: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
};

export function TopBar({ title = 'L-Note', onBack, rightLabel, onRightPress }: TopBarProps) {
  return (
    <View style={styles.topBar}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.iconButton} hitSlop={10}>
          <Text style={styles.iconText}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.iconButton}>
          <Text style={styles.iconText}>≡</Text>
        </View>
      )}
      <Text style={styles.brand}>{title}</Text>
      <Pressable onPress={onRightPress} style={styles.iconButton} hitSlop={10}>
        <Text style={[styles.iconText, onRightPress ? null : styles.iconMuted]}>{rightLabel ?? '○'}</Text>
      </Pressable>
    </View>
  );
}

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function Button({ children, onPress, disabled, variant = 'primary', style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' && styles.buttonSecondaryText,
          variant === 'ghost' && styles.buttonGhostText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

type BadgeProps = {
  label: string;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        tone === 'info' && styles.badgeInfo,
        tone === 'success' && styles.badgeSuccess,
        tone === 'warning' && styles.badgeWarning,
        tone === 'danger' && styles.badgeDanger,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          tone === 'info' && styles.badgeTextInfo,
          tone === 'success' && styles.badgeTextSuccess,
          tone === 'warning' && styles.badgeTextWarning,
          tone === 'danger' && styles.badgeTextDanger,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type InputProps = TextInputProps & {
  label?: string;
};

export function Input({ label, style, ...props }: InputProps) {
  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.outline} style={[styles.input, style]} {...props} />
    </View>
  );
}

type BottomNavProps = {
  active: 'dashboard' | 'history' | 'reports' | 'settings';
  onDashboard: () => void;
  onHistory: () => void;
  onReports?: () => void;
  onSettings?: () => void;
};

export function BottomNav({ active, onDashboard, onHistory, onReports, onSettings }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <NavItem label="Beranda" icon="⌂" active={active === 'dashboard'} onPress={onDashboard} />
      <NavItem label="Riwayat" icon="↺" active={active === 'history'} onPress={onHistory} />
      <NavItem label="Laporan" icon="▤" active={active === 'reports'} onPress={onReports ?? (() => undefined)} />
      <NavItem label="Atur" icon="⚙" active={active === 'settings'} onPress={onSettings ?? (() => undefined)} />
    </View>
  );
}

function NavItem({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.navItem, active && styles.navItemActive]}>
      <Text style={[styles.navIcon, active && styles.navTextActive]}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.stateText}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.state}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stateText}>{subtitle}</Text> : null}
    </View>
  );
}

export function statusLabel(status: Transaction['status']) {
  const labels: Record<Transaction['status'], string> = {
    pending: 'Menunggu',
    proses: 'Proses',
    selesai: 'Selesai',
    diambil: 'Diambil',
  };
  return labels[status] ?? status;
}

export function statusTone(status: Transaction['status']): BadgeProps['tone'] {
  if (status === 'selesai' || status === 'diambil') return 'success';
  if (status === 'proses') return 'info';
  return 'warning';
}

export function paymentLabel(payment: Transaction['payment_status']) {
  return payment === 'lunas' ? 'Lunas' : 'Belum Lunas';
}

export function paymentTone(payment: Transaction['payment_status']): BadgeProps['tone'] {
  return payment === 'lunas' ? 'success' : 'danger';
}

export const textStyles: Record<string, StyleProp<TextStyle>> = {
  title: typography.title,
  heading: typography.heading,
  body: typography.body,
  label: typography.label,
};

const elevation: ViewStyle = {
  boxShadow: '0px 4px 12px rgba(13, 115, 119, 0.08)',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  topBar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: colors.textMuted,
    fontSize: 28,
    fontWeight: '700',
  },
  iconMuted: {
    color: colors.outline,
  },
  brand: {
    color: colors.primary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(190, 201, 201, 0.45)',
    ...elevation,
  },
  button: {
    minHeight: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.secondaryContainer,
  },
  buttonSecondaryText: {
    color: colors.onSecondaryContainer,
  },
  buttonGhost: {
    backgroundColor: colors.surfaceLow,
  },
  buttonGhostText: {
    color: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  badgeInfo: {
    backgroundColor: colors.infoContainer,
  },
  badgeTextInfo: {
    color: colors.onInfoContainer,
  },
  badgeSuccess: {
    backgroundColor: colors.secondaryContainer,
  },
  badgeTextSuccess: {
    color: colors.onSecondaryContainer,
  },
  badgeWarning: {
    backgroundColor: colors.warningContainer,
  },
  badgeTextWarning: {
    color: colors.onWarningContainer,
  },
  badgeDanger: {
    backgroundColor: colors.errorContainer,
  },
  badgeTextDanger: {
    color: colors.onErrorContainer,
  },
  inputWrap: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text,
  },
  input: {
    minHeight: 56,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceLowest,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 16,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 88,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    backgroundColor: colors.surfaceLowest,
    boxShadow: '0px -4px 12px rgba(13, 115, 119, 0.08)',
  },
  navItem: {
    minWidth: 68,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
  },
  navItemActive: {
    backgroundColor: colors.secondaryContainer,
  },
  navIcon: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '700',
  },
  navLabel: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  navTextActive: {
    color: colors.onSecondaryContainer,
  },
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.section,
    gap: spacing.sm,
  },
  stateText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
});
