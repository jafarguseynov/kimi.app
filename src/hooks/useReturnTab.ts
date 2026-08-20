import { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

/**
 * "Geri" düyməsi istifadəçini gəldiyi TABA qaytarır.
 *
 * PROBLEM: Premium/abunəlik/ödəniş ekranları `HomeNavigator`-da qeydiyyatdadır.
 * Onları başqa tabdan (məs. İmtahanlar) açanda naviqasiya əvvəlcə Ana səhifə
 * tabına keçir və stack-də altda `HomeMain` qalır. Geri basanda `goBack()`
 * həmin stack-i pop edir → istifadəçi gəldiyi yerə YOX, Ana səhifəyə düşür.
 *
 * HƏLL: çağıran ekran `returnTab` parametri ötürür; pop baş verdikdən sonra
 * bu hook tabı geri qaytarır. Home stack pop olunduğu üçün `HomeMain`-də təmiz
 * qalır — Ana səhifəyə keçəndə Premium ekranı orada "asılı" qalmır.
 *
 * Yalnız GERİ hərəkətində işə düşür (başlıqdakı düymə, iOS sürüşdürmə jesti,
 * Android hardware back). İrəli keçidlərdə (Plans → PaymentMethod) toxunmur.
 *
 * İstifadə:
 *   // çağıran (İmtahanlar tabı):
 *   nav.navigate(Routes.Home, { screen: Routes.Plans, params: { returnTab: 'Exams' } })
 *   // hədəf ekran:
 *   useReturnTab();
 */
export function useReturnTab() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const returnTab: string | undefined = route.params?.returnTab;

  useEffect(() => {
    if (!returnTab) return;
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      const type = e?.data?.action?.type;
      if (type !== 'GO_BACK' && type !== 'POP' && type !== 'POP_TO_TOP') return;
      // Pop tamamlandıqdan sonra tabı dəyiş (eyni tick-də etsək naviqasiya
      // vəziyyəti hələ yenilənməmiş olur).
      setTimeout(() => navigation.getParent()?.navigate(returnTab), 0);
    });
    return unsubscribe;
  }, [navigation, returnTab]);
}
