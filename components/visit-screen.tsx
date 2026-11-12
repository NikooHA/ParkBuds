import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from './theme';
import { useLayout } from './use-layout';
import { useSerifFonts } from './use-serif-fonts';
import { useVisit, VISIT_MINUTES } from './visit-store';

export function VisitScreen() {
  const { wideWeb, w, h } = useLayout();

  if (wideWeb) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}
      >
        <View style={{ width: '100%', maxWidth: 560 }}>
          <VisitForm />
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          alignSelf: 'center',
          paddingHorizontal: w(12),
          paddingTop: h(8),
          paddingBottom: h(12),
        }}
      >
        <VisitForm />
      </ScrollView>
    </SafeAreaView>
  );
}

function VisitForm() {
  const router = useRouter();
  const { w, h } = useLayout();
  const { serifBold } = useSerifFonts();
  const { checkedIn, dogName, personName, saveNames, leave } = useVisit();
  const [dog, setDog] = useState('');
  const [person, setPerson] = useState('');
  const personRef = useRef<ComponentRef<typeof TextInput>>(null);

  useFocusEffect(
    useCallback(() => {
      setDog(checkedIn ? dogName : '');
      setPerson(checkedIn ? personName : '');
    }, [checkedIn, dogName, personName]),
  );

  function goHome() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  function onCheckIn() {
    saveNames(dog.trim(), person.trim());
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    goHome();
  }

  function onLeave() {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    leave();
    goHome();
  }

  return (
    <View
      style={{
        backgroundColor: colors.visit,
        borderRadius: w(28),
        borderCurve: 'continuous',
        paddingHorizontal: w(20),
        paddingTop: h(18),
        paddingBottom: h(22),
      }}
    >
      <Text
        style={{
          marginTop: h(22),
          fontFamily: serifBold,
          fontSize: w(34),
          lineHeight: w(40),
          letterSpacing: w(-0.6),
          color: colors.ink,
        }}
      >
        Checking in
      </Text>
      <Text style={{ marginTop: h(8), fontSize: w(16), lineHeight: w(22), color: colors.muted }}>
        Share your names if you’d like others to see who’s here.
      </Text>

      <View style={{ flexDirection: 'row', gap: w(12), marginTop: h(22) }}>
        <View style={{ flex: 1, gap: h(8) }}>
          <Text style={{ fontSize: w(15), fontWeight: '700', color: colors.ink }}>Dog’s name</Text>
          <TextInput
            value={dog}
            onChangeText={setDog}
            accessibilityLabel="Dog's name"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            maxLength={24}
            placeholder="Name"
            placeholderTextColor={colors.label}
            onSubmitEditing={() => personRef.current?.focus()}
            style={{
              backgroundColor: colors.card,
              borderRadius: w(14),
              borderCurve: 'continuous',
              minHeight: h(52),
              paddingHorizontal: w(14),
              fontSize: w(17),
              color: colors.text,
            }}
          />
        </View>
        <View style={{ flex: 1, gap: h(8) }}>
          <Text style={{ fontSize: w(15), fontWeight: '700', color: colors.ink }}>Your name</Text>
          <TextInput
            ref={personRef}
            value={person}
            onChangeText={setPerson}
            accessibilityLabel="Your name"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            maxLength={24}
            placeholder="Name"
            placeholderTextColor={colors.label}
            onSubmitEditing={onCheckIn}
            style={{
              backgroundColor: colors.card,
              borderRadius: w(14),
              borderCurve: 'continuous',
              minHeight: h(52),
              paddingHorizontal: w(14),
              fontSize: w(17),
              color: colors.text,
            }}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: w(18), marginTop: h(16) }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check in"
          onPress={onCheckIn}
          style={({ pressed }) => ({
            opacity: pressed ? 0.86 : 1,
            backgroundColor: colors.accent,
            borderRadius: w(12),
            borderCurve: 'continuous',
            minHeight: h(46),
            paddingHorizontal: w(18),
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text style={{ color: '#FFFFFF', fontSize: w(16), fontWeight: '700' }}>Check in!</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="I'm leaving" onPress={onLeave} hitSlop={w(8)}>
          <Text style={{ color: colors.accent, fontSize: w(17), fontWeight: '700' }}>I’m leaving</Text>
        </Pressable>
      </View>

      <Text style={{ marginTop: h(18), fontSize: w(15), lineHeight: w(21), color: colors.muted }}>
        Check-ins end after {VISIT_MINUTES} minutes.
      </Text>
    </View>
  );
}
