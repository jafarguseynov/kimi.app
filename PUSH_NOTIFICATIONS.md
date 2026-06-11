# Push bildirişləri — quraşdırma (EAS / dev build)

Kod hazırdır: icazə priming axını + Expo push token alınması ([src/utils/push.ts](src/utils/push.ts)).
Token alınması üçün **EAS `projectId`** lazımdır. Aşağıdakı bir-dəfəlik addımlar `projectId`-ni
`app.json`-a yazır və **dev build** yaradır (Expo Go push-u dəstəkləmir).

## 1. EAS CLI + login
```bash
npm i -g eas-cli         # və ya: npx eas-cli@latest <komanda>
eas login                # Expo hesabı ilə daxil ol
```

## 2. Layihəni EAS-ə bağla (projectId yaradır)
```bash
eas init
```
Bu, `app.json`-a avtomatik əlavə edir:
```json
"extra": { "eas": { "projectId": "xxxxxxxx-xxxx-..." } },
"owner": "<expo-istifadeci-adin>"
```
> `push.ts` bu `projectId`-ni `Constants.expoConfig.extra.eas.projectId`-dən oxuyur — başqa
> dəyişiklik lazım deyil.

## 3. Push credential-ları (push çatdırılması üçün)
İlk `eas build` zamanı EAS avtomatik soruşur/yaradır:
- **iOS:** APNs key (Apple Developer hesabı tələb olunur).
- **Android:** FCM V1 service-account açarı (Firebase layihəsi).
İstəsən əvvəlcədən: `eas credentials`.

## 4. Dev build yarat və işə sal
```bash
# Bulud build (tövsiyə):
eas build --profile development --platform ios       # və ya android
# və ya lokal (Xcode / Android Studio quraşdırılıbsa):
npx expo run:ios
npx expo run:android
```
Build-i cihaza/simulyatora qur, sonra dev server:
```bash
npx expo start --dev-client
```

## 5. Yoxlama (dev build-də)
1. İlk giriş → rola uyğun **priming ekranı** açılır (şagird/müəllim/valideyn mətnləri).
2. **"İcazə ver"** → OS dialoqu → icazə veriləndə Expo push token alınır və
   backend-ə yazılır: `POST /notification/push-token` ([notification.controller.ts](../kimi-az-backend/src/notification/notification.controller.ts)).
3. **"İndi yox"** → bir daha avtomatik soruşulmur (`primingSeen`, SecureStore).

> ⚠️ Token-in backend-də saxlanması üçün backend **deploy** olunmalıdır (yeni `pushToken`
> sütunu + endpoint canlıda olmalıdır). Sütun `synchronize:true` ilə avtomatik yaranır.

## Sonrakı iş (bu scope-dan kənar)
- **Real göndərmə** (server → cihaz): backend-də `expo-server-sdk` ilə saxlanan token-lərə
  push atmaq (`NotificationService.create` yanında). Hələ qurulmayıb.
- Tənzimləmələrdə "Bildirişləri aç/söndür" (OS Settings deep-link).

## Expo Go qeydi
Expo Go (SDK 53+) push native modulu daşımır. `push.ts` Expo Go-nu aşkar edir və modulu
yükləmir → app çökmür, amma push orada **işləmir**. Test üçün yuxarıdakı dev build lazımdır.
