import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import { useAppUpdate } from '../hooks/useAppUpdate';

/**
 * Ana səhifədə "yeni versiya mövcuddur" banneri.
 *  - OTA hazırdırsa: tıklananda tətbiqə tətbiq olunur (reload).
 *  - Store versiyası varsa: App Store / Play Store-a yönləndirir.
 */
export default function UpdateBanner() {
  const { visible, mode, storeUpdate, applyOta, openStore, dismiss } = useAppUpdate();

  if (!visible) return null;

  const isStore = mode === 'store';
  const title = isStore ? (storeUpdate?.message || 'Yeni versiya mövcuddur') : 'Yeni versiya hazırdır';
  const subtitle = isStore ? 'Yeniləmək üçün toxunun' : 'Tətbiq etmək üçün toxunun';
  const onPress = isStore ? openStore : applyOta;
  const canDismiss = !(isStore && storeUpdate?.force);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.wrapper}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={isStore ? 'cloud-download-outline' : 'sparkles'} size={20} color={Colors.white} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.white} style={{ opacity: 0.9 }} />
        {canDismiss && (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); dismiss(); }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={16} color={Colors.white} />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginTop: 12 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  subtitle: { color: Colors.white, opacity: 0.85, fontSize: 12, marginTop: 1 },
  closeBtn: { padding: 2 },
});
