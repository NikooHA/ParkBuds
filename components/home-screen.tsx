import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sampleVisitLabel, sampleVisits } from '../data/sample-visits';
import { PawIcon } from './paw-icon';
import { colors } from './theme';
import { useSerifFonts } from './use-serif-fonts';
import { useVisit } from './visit-store';

export function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const imageWidth = Math.min(width, 440) * 0.78;
  const imageHeight = imageWidth * (4 / 3);
  const { serifSemi, serifBold } = useSerifFonts();
  const { count, guestLabel } = useVisit();
  const visitors = [
    ...sampleVisits.map((visit) => ({
      id: visit.id,
      label: sampleVisitLabel(visit),
      isYou: false,
    })),
    ...(count > 0 ? [{ id: 'you', label: guestLabel, isYou: true }] : []),
  ];

  function onCheckIn() {
    router.push('/visit');
  }

  function onOpenSession() {
    router.push('/visit');
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
          maxWidth: 440,
          alignSelf: 'center',
          paddingHorizontal: 22,
          paddingTop: 8,
          paddingBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PawIcon size={26} color="#FFFFFF" />
          </View>
          <Text
            style={{
              fontFamily: serifSemi,
              fontSize: 28,
              color: colors.ink,
              letterSpacing: -0.4,
            }}
          >
            ParkBuds
          </Text>
        </View>

        <Text
          style={{
            marginTop: 28,
            fontFamily: serifBold,
            fontSize: 30,
            lineHeight: 34,
            letterSpacing: -1.1,
            color: colors.ink,
          }}
        >
          See who’s{'\n'}at the park.
        </Text>

        <View style={{ flexGrow: 1, minHeight: 220 + height * 0.25 }} />

        <View
          style={{
            marginTop: 16,
            backgroundColor: 'rgba(255, 249, 243, 0.92)',
            borderRadius: 22,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: colors.line,
            paddingHorizontal: 18,
            paddingVertical: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text
              selectable
              style={
                visitors.length === 0
                  ? { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text }
                  : {
                      flex: 1,
                      fontSize: 28,
                      lineHeight: 34,
                      fontWeight: '700',
                      letterSpacing: -0.4,
                      color: colors.text,
                      fontVariant: ['tabular-nums'],
                    }
              }
            >
              {visitors.length === 0 ? 'No one is checked in' : `${visitors.length} checked in`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.live,
                }}
              />
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.live }}>Live</Text>
            </View>
          </View>
          {visitors.length > 0 ? (
            <View style={{ gap: 14, marginTop: 14 }}>
              <View style={{ height: 1, backgroundColor: colors.line }} />
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

        <View style={{ flexGrow: 1, minHeight: 28 }} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check in"
          onPress={onCheckIn}
          style={({ pressed }) => ({
            opacity: pressed ? 0.86 : 1,
            backgroundColor: colors.accent,
            borderRadius: 16,
            borderCurve: 'continuous',
            minHeight: 56,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
          })}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>Check in</Text>
        </Pressable>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function GuestRow({ label, onPress }: { label: string; onPress?: () => void }) {
  const content = (
    <>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.badge,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PawIcon size={18} color={colors.accent} />
      </View>
      <Text selectable={!onPress} style={{ flex: 1, fontSize: 16, fontWeight: '500', color: colors.text }}>
        {label}
      </Text>
    </>
  );

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderCurve: 'continuous' as const,
    backgroundColor: '#FFFCF8',
    boxShadow: '0 1px 2px rgba(58, 44, 38, 0.08)',
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
