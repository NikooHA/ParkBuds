import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PawIcon } from './paw-icon';
import { colors } from './theme';
import { useLayout } from './use-layout';
import { useSerifFonts } from './use-serif-fonts';
import { PARK_CAPACITY, useVisit } from './visit-store';

export function HomeScreen() {
  const router = useRouter();
  const { width, height, wideWeb, w, h } = useLayout();
  const maxImageHeight = height * 0.481;
  const imageHeight = Math.min(width * 0.78 * (4 / 3), maxImageHeight);
  const imageWidth = imageHeight * (3 / 4);
  const { serifSemi, serifBold } = useSerifFonts();
  const { visitors, full, status, statusMessage } = useVisit();
  const emptyText = emptyMessage(status, statusMessage);

  function onCheckIn() {
    router.push('/visit');
  }

  function onOpenSession() {
    router.push('/visit');
  }

  if (wideWeb) {
    return <HomeLaptop roster={visitors} full={full} emptyText={emptyText} onCheckIn={onCheckIn} onOpenSession={onOpenSession} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Image
        source={require('../assets/dog-portrait.jpg')}
        style={{
          position: 'absolute',
          width: imageWidth,
          height: imageHeight,
          left: (width - imageWidth) / 2,
          top: (height - imageHeight) / 2,
        }}
        contentFit="contain"
        accessible={false}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'bottom']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          alignSelf: 'center',
          paddingHorizontal: w(22),
          paddingTop: h(8),
          paddingBottom: h(12),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: w(10) }}>
          <View
            style={{
              width: w(46),
              height: w(46),
              borderRadius: w(14),
              borderCurve: 'continuous',
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PawIcon size={w(26)} color="#FFFFFF" />
          </View>
          <Text
            style={{
              fontFamily: serifSemi,
              fontSize: w(28),
              color: colors.ink,
              letterSpacing: w(-0.4),
            }}
          >
            ParkBuds
          </Text>
        </View>

        <Text
          style={{
            marginTop: h(28),
            fontFamily: serifBold,
            fontSize: w(30),
            lineHeight: w(34),
            letterSpacing: w(-1.1),
            color: colors.ink,
          }}
        >
          See who’s{'\n'}at the park.
        </Text>

        <View style={{ flexGrow: 1, minHeight: height * 0.44 }} />

        <View
          style={{
            marginTop: h(16),
            backgroundColor: 'rgba(255, 249, 243, 0.92)',
            borderRadius: w(22),
            borderCurve: 'continuous',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.line,
            paddingHorizontal: w(18),
            paddingVertical: h(16),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: w(12) }}>
            <Text
              selectable
              style={
                visitors.length === 0
                  ? { flex: 1, fontSize: w(16), fontWeight: '700', color: colors.text }
                  : {
                      flex: 1,
                      fontSize: w(28),
                      lineHeight: w(34),
                      fontWeight: '700',
                      letterSpacing: w(-0.4),
                      color: colors.text,
                      fontVariant: ['tabular-nums'],
                    }
              }
            >
              {visitors.length === 0 ? emptyText : `${visitors.length} checked in`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: w(6) }}>
              <View
                style={{
                  width: w(8),
                  height: w(8),
                  borderRadius: w(4),
                  backgroundColor: colors.live,
                }}
              />
              <Text style={{ fontSize: w(15), fontWeight: '600', color: colors.live }}>Live</Text>
            </View>
          </View>
          {visitors.length > 0 ? (
            <View style={{ gap: h(14), marginTop: h(14) }}>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }} />
              {visitors.map((visitor) => (
                <GuestRow
                  key={visitor.id}
                  label={visitor.label}
                  onPress={visitor.isYou ? onOpenSession : undefined}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ flexGrow: 1, minHeight: h(28) }} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={full ? 'Park is full' : 'Check in'}
          accessibilityState={{ disabled: full }}
          disabled={full}
          onPress={onCheckIn}
          style={({ pressed }) => ({
            opacity: full ? 0.5 : pressed ? 0.86 : 1,
            backgroundColor: colors.accent,
            borderRadius: w(16),
            borderCurve: 'continuous',
            minHeight: h(56),
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: w(20),
          })}
        >
          <Text style={{ color: '#FFFFFF', fontSize: w(17), fontWeight: '700' }}>
            {full ? `Park is full (${PARK_CAPACITY})` : 'Check in'}
          </Text>
        </Pressable>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HomeLaptop({
  roster,
  full,
  emptyText,
  onCheckIn,
  onOpenSession,
}: {
  roster: { id: string; label: string; isYou: boolean }[];
  full: boolean;
  emptyText: string;
  onCheckIn: () => void;
  onOpenSession: () => void;
}) {
  const { width, height } = useLayout();
  const { serifSemi, serifBold } = useSerifFonts();
  const imageHeight = Math.round(height * 0.96);
  const imageWidth = Math.round(imageHeight * 0.75);
  const cardWidth = Math.min(860, Math.max(480, width - imageWidth - 72));
  const columns = 3;
  const gridGap = 10;
  const cellWidth = (cardWidth - 44 - gridGap * (columns - 1)) / columns;
  const hereCount = roster.length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1, minHeight: height, alignItems: 'flex-start' }}
    >
      <View style={{ flex: 1, width: '100%', minHeight: height, paddingLeft: 36, paddingRight: 28, paddingTop: 24, paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                borderCurve: 'continuous',
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PawIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={{ fontFamily: serifSemi, fontSize: 22, color: colors.ink, letterSpacing: -0.3 }}>ParkBuds</Text>
          </View>
        </View>

        <View style={{ flex: 1, marginTop: 28 }}>
          <View style={{ maxWidth: 560, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.6, color: colors.accent }}>
              YOUR NEIGHBOURHOOD DOG PARK
            </Text>
            <Text
              style={{
                marginTop: 16,
                fontFamily: serifBold,
                fontSize: 64,
                lineHeight: 68,
                letterSpacing: -1.8,
                color: colors.ink,
              }}
            >
              See who’s{'\n'}at the park.
            </Text>
            <Text style={{ marginTop: 16, maxWidth: 420, fontSize: 18, lineHeight: 26, color: colors.muted }}>
              Find out who’s here before you grab the leash.
            </Text>
          </View>

          <Image
            source={require('../assets/dog-portrait.jpg')}
            style={{
              position: 'absolute',
              right: 0,
              top: -36,
              width: imageWidth,
              height: imageHeight,
            }}
            contentFit="contain"
            contentPosition="top"
            accessible={false}
          />

        <View
          style={{
            marginTop: 'auto',
            marginBottom: 56,
            width: cardWidth,
            alignSelf: 'flex-start',
            backgroundColor: colors.card,
            borderRadius: 24,
            borderCurve: 'continuous',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.line,
            paddingHorizontal: 22,
            paddingTop: 20,
            paddingBottom: 18,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.muted }}>At the park now</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.live }} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.live }}>Live</Text>
            </View>
          </View>
          {hereCount === 0 ? (
            <Text style={{ marginTop: 18, fontSize: 20, fontWeight: '700', color: colors.text }}>{emptyText}</Text>
          ) : (
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
              <Text
                selectable
                style={{
                  fontFamily: serifBold,
                  fontSize: 44,
                  lineHeight: 48,
                  letterSpacing: -1.2,
                  color: colors.ink,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {hereCount}
              </Text>
              <Text style={{ marginBottom: 6, fontSize: 16, color: colors.muted }}>checked in</Text>
            </View>
          )}
          <ScrollView
            style={{ maxHeight: 210, marginTop: 14, width: '100%' }}
            contentContainerStyle={{ width: cardWidth - 44, flexDirection: 'row', flexWrap: 'wrap', gap: gridGap }}
          >
            {roster.map((person) => (
              <ParkTile
                key={person.id}
                label={person.label}
                width={cellWidth}
                onPress={person.isYou ? onOpenSession : undefined}
              />
            ))}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={full ? 'Park is full' : 'Check in'}
            accessibilityState={{ disabled: full }}
            disabled={full}
            onPress={onCheckIn}
            style={({ pressed }) => ({
              opacity: full ? 0.5 : pressed ? 0.86 : 1,
              marginTop: 16,
              backgroundColor: colors.accent,
              borderRadius: 12,
              borderCurve: 'continuous',
              minHeight: 46,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 18,
              alignSelf: 'flex-start',
            })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
              {full ? `Park is full (${PARK_CAPACITY})` : 'Check in'}
            </Text>
          </Pressable>
        </View>
        </View>
      </View>
    </ScrollView>
  );
}

function emptyMessage(status: 'loading' | 'ready' | 'error', statusMessage: string) {
  if (status === 'loading') return 'Checking the park…';
  if (status === 'error') return statusMessage;
  return 'No one is checked in';
}

function ParkTile({
  label,
  width,
  onPress,
}: {
  label: string;
  width: number;
  onPress?: () => void;
}) {
  const body = (
    <>
      <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
        {label}
      </Text>
      <Text style={{ marginTop: 4, fontSize: 13, fontWeight: '600', color: colors.live }}>Here</Text>
    </>
  );
  const tileStyle = {
    width,
    borderRadius: 14,
    borderCurve: 'continuous' as const,
    backgroundColor: '#FFFCF8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    boxShadow: '0 1px 2px rgba(58, 44, 38, 0.08)',
  };

  if (!onPress) {
    return <View style={tileStyle}>{body}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, your session`}
      onPress={onPress}
      style={({ pressed }) => ({ ...tileStyle, opacity: pressed ? 0.6 : 1 })}
    >
      {body}
    </Pressable>
  );
}

function GuestRow({ label, onPress }: { label: string; onPress?: () => void }) {
  const { w, h } = useLayout();
  const content = (
    <>
      <View
        style={{
          width: w(36),
          height: w(36),
          borderRadius: w(18),
          backgroundColor: colors.badge,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PawIcon size={w(18)} color={colors.accent} />
      </View>
      <Text selectable={!onPress} style={{ flex: 1, fontSize: w(16), fontWeight: '500', color: colors.text }}>
        {label}
      </Text>
    </>
  );

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: w(12),
    paddingVertical: h(8),
    paddingHorizontal: w(10),
    borderRadius: w(14),
    borderCurve: 'continuous' as const,
    backgroundColor: '#FFFCF8',
    boxShadow: `0 ${h(1)}px ${h(2)}px rgba(58, 44, 38, 0.08)`,
  };

  if (!onPress) {
    return <View style={rowStyle}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, your session`}
      onPress={onPress}
      style={({ pressed }) => ({
        ...rowStyle,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {content}
    </Pressable>
  );
}
