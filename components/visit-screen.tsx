import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from './theme';
import { useSerifFonts } from './use-serif-fonts';
import { useVisit } from './visit-store';

export function VisitScreen() {
  const router = useRouter();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          maxWidth: 440,
          alignSelf: 'center',
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: colors.visit,
            borderRadius: 28,
            borderCurve: 'continuous',
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 22,
          }}
        >

          <Text
            style={{
              marginTop: 22,
              fontFamily: serifBold,
              fontSize: 34,
              lineHeight: 40,
              letterSpacing: -0.6,
              color: colors.ink,
            }}
          >
            Checking in
          </Text>
          <Text style={{ marginTop: 8, fontSize: 16, lineHeight: 22, color: colors.muted }}>
            Share your names if you’d like others to see who’s here.
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>Dog’s name</Text>
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
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  minHeight: 52,
                  paddingHorizontal: 14,
                  fontSize: 17,
                  color: colors.text,
                }}
              />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>Your name</Text>
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
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  minHeight: 52,
                  paddingHorizontal: 14,
                  fontSize: 17,
                  color: colors.text,
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 16 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Check in"
              onPress={onCheckIn}
              style={({ pressed }) => ({
                opacity: pressed ? 0.86 : 1,
                backgroundColor: colors.accent,
                borderRadius: 12,
                borderCurve: 'continuous',
                minHeight: 46,
                paddingHorizontal: 18,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Check in!</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="I'm leaving" onPress={onLeave} hitSlop={8}>
              <Text style={{ color: colors.accent, fontSize: 17, fontWeight: '700' }}>I’m leaving</Text>
            </Pressable>
          </View>

          <Text style={{ marginTop: 18, fontSize: 15, lineHeight: 21, color: colors.muted }}>
            Check-ins end after 60 minutes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
