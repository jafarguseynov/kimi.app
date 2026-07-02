/**
 * Expo config plugin — köhnə Android cihazlarda Let's Encrypt TLS problemini həll edir.
 *
 * PROBLEM: kimi.az sertifikatı 2025 Let's Encrypt ECDSA zəncirinə keçib
 * (leaf → YE1 → Root YE → ISRG Root X2). Köhnə Android (< 7.1.1, həmçinin bəzi
 * 7.x–9 cihazlar) bu zənciri sistem trust store ilə validasiya edə bilmir → TLS
 * handshake qırılır → tətbiq serverə çata bilmir ("Giriş zamanı xəta").
 *
 * HƏLL: APK-ya ISRG Root X1 + X2 köklərini əlavə et və network security config ilə
 * onları system CA-larla birlikdə etibarlı elan et. Beləcə tətbiq Let's Encrypt
 * sertifikatını cihazın yaşından/OS trust store-undan asılı olmayaraq özü tanıyır.
 * Zəncir birbaşa ISRG Root X2-də bitdiyi üçün X2-ni anchor kimi əlavə etmək kifayətdir;
 * X1 də əlavə olunur ki, gələcəkdə RSA zəncirinə qayıdılsa da işləsin.
 *
 * cleartextTrafficPermitted="true" — mövcud davranışı qoruyur (Expo default cleartext-ə
 * icazə verir; yalnız trust-anchor əlavə edirik, mövcud http yüklərini sındırmırıq).
 */
const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="@raw/isrg_root_x1" />
            <certificates src="@raw/isrg_root_x2" />
        </trust-anchors>
    </base-config>
</network-security-config>
`;

/** res/xml/network_security_config.xml + res/raw/*.pem yaz (prebuild zamanı). */
function withCertFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const resDir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');
      const xmlDir = path.join(resDir, 'xml');
      const rawDir = path.join(resDir, 'raw');
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.mkdirSync(rawDir, { recursive: true });

      fs.writeFileSync(
        path.join(xmlDir, 'network_security_config.xml'),
        NETWORK_SECURITY_CONFIG,
        'utf8',
      );

      const certsSrc = path.join(cfg.modRequest.projectRoot, 'certs');
      for (const name of ['isrg_root_x1.pem', 'isrg_root_x2.pem']) {
        const from = path.join(certsSrc, name);
        if (!fs.existsSync(from)) {
          throw new Error(`[withLetsEncryptTrust] cert tapılmadı: ${from}`);
        }
        fs.copyFileSync(from, path.join(rawDir, name));
      }
      return cfg;
    },
  ]);
}

/** AndroidManifest <application>-a android:networkSecurityConfig əlavə et. */
function withManifestAttr(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return cfg;
  });
}

module.exports = function withLetsEncryptTrust(config) {
  config = withCertFiles(config);
  config = withManifestAttr(config);
  return config;
};
