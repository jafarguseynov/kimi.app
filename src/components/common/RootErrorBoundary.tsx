import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  attempt: number;
}

/**
 * Kök səviyyəli xəta tutucusu — tətbiqin "açılmır" görünməsinin qarşısını alır.
 *
 * PROBLEM: React Native release buildində render zamanı atılan istənilən xəta
 * bütün ağacı söküb AĞ EKRAN qoyur. İstifadəçi (və Google Play yoxlayıcısı) bunu
 * "tətbiq açılmır / yüklənmir" kimi görür — Play 113-cü buildi məhz bu səbəbə
 * görə «Broken Functionality» ilə rədd etmişdi.
 *
 * HƏLL: ağac ən yuxarıdan (provider-lərdən də əvvəl) tutucu ilə əhatə olunur.
 * Xəta baş verərsə istifadəçi ağ ekran deyil, izahlı ekran + «Yenidən cəhd et»
 * düyməsi görür; düymə ağacı yenidən qurur (attempt açarı ilə tam remount).
 *
 * ⚠️ Bu komponent QƏSDƏN heç bir asılılıq götürmür (i18n, store, naviqasiya,
 * ikon paketi yoxdur) — çünki xətanın mənbəyi məhz onlardan biri ola bilər.
 */
export default class RootErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Release buildində konsol yoxdur, amma Play Console / logcat izini saxlayır.
    console.error('[RootErrorBoundary]', error?.message, info?.componentStack);
  }

  private retry = () => {
    this.setState((s) => ({ error: null, attempt: s.attempt + 1 }));
  };

  render() {
    if (!this.state.error) {
      // attempt açarı: retry-də bütün alt ağac sıfırdan qurulur (köhnə vəziyyət qalmır).
      return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
    }

    return (
      <View style={s.wrap}>
        <Image
          source={require('../../../assets/logo.png')}
          style={s.logo}
          resizeMode="contain"
        />
        <Text style={s.title}>Nəsə səhv getdi</Text>
        <Text style={s.sub}>
          Tətbiqdə gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin —
          məlumatlarınız itməyib.
        </Text>
        <TouchableOpacity style={s.cta} activeOpacity={0.85} onPress={this.retry}>
          <Text style={s.ctaText}>Yenidən cəhd et</Text>
        </TouchableOpacity>
        <Text style={s.hint}>Problem təkrarlanarsa: kimi.az üzərindən bizə yazın.</Text>
      </View>
    );
  }
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: Colors.background,
  },
  logo: { width: 180, height: 84, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  sub: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  cta: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  hint: { marginTop: 18, fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
});
