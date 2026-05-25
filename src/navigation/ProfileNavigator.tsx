import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from '../constants/routes';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import VerificationStartScreen from '../screens/profile/VerificationStartScreen';
import VerificationDocumentsScreen from '../screens/profile/VerificationDocumentsScreen';
import VerificationPendingScreen from '../screens/profile/VerificationPendingScreen';
import VerificationRejectedScreen from '../screens/profile/VerificationRejectedScreen';
import VerificationSuccessScreen from '../screens/profile/VerificationSuccessScreen';
import ParentChildrenScreen from '../screens/profile/ParentChildrenScreen';
import ChildAcademicReportScreen from '../screens/profile/ChildAcademicReportScreen';
import ChildActivityScreen from '../screens/profile/ChildActivityScreen';
import ConnectChildScreen from '../screens/profile/ConnectChildScreen';
import EnterChildCodeScreen from '../screens/profile/EnterChildCodeScreen';
import ConnectionPendingScreen from '../screens/profile/ConnectionPendingScreen';
import ConnectionSuccessScreen from '../screens/profile/ConnectionSuccessScreen';
import WithdrawalScreen from '../screens/payment/WithdrawalScreen';
import WithdrawalSuccessScreen from '../screens/payment/WithdrawalSuccessScreen';
import PayoutHistoryScreen from '../screens/payment/PayoutHistoryScreen';
import WalletScreen from '../screens/payment/WalletScreen';
import ReferralScreen from '../screens/profile/ReferralScreen';
import ReferralBalanceScreen from '../screens/profile/ReferralBalanceScreen';
import TeacherDashboardScreen from '../screens/profile/TeacherDashboardScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import TermsOfServiceScreen from '../screens/settings/TermsOfServiceScreen';
import SupportScreen from '../screens/settings/SupportScreen';
import HelpCenterScreen from '../screens/settings/HelpCenterScreen';
import ReportProblemScreen from '../screens/settings/ReportProblemScreen';
import AboutAppScreen from '../screens/settings/AboutAppScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import PasswordChangedScreen from '../screens/settings/PasswordChangedScreen';
import AccountManagementScreen from '../screens/settings/AccountManagementScreen';
import BlockedUsersScreen from '../screens/settings/BlockedUsersScreen';
import DeactivateReasonScreen from '../screens/settings/DeactivateReasonScreen';
import AccountDeactivatedScreen from '../screens/settings/AccountDeactivatedScreen';
import DeleteAccountConfirmScreen from '../screens/settings/DeleteAccountConfirmScreen';
import LogoutConfirmScreen from '../screens/settings/LogoutConfirmScreen';
import AchievementsScreen from '../screens/home/AchievementsScreen';
import CertificateListScreen from '../screens/exam/CertificateListScreen';
import CertificatePreviewScreen from '../screens/exam/CertificatePreviewScreen';
import ExamHistoryScreen from '../screens/exam/ExamHistoryScreen';
import ExamResultScreen from '../screens/exam/ExamResultScreen';
import DuelHistoryScreen from '../screens/exam/DuelHistoryScreen';
import RewardHistoryScreen from '../screens/profile/RewardHistoryScreen';

const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name={Routes.ProfileHome} component={ProfileScreen} />
      <Stack.Screen name={Routes.EditProfile} component={EditProfileScreen} />
      <Stack.Screen name={Routes.VerificationStart} component={VerificationStartScreen} />
      <Stack.Screen name={Routes.VerificationDocuments} component={VerificationDocumentsScreen} />
      <Stack.Screen name={Routes.VerificationPending} component={VerificationPendingScreen} />
      <Stack.Screen name={Routes.VerificationRejected} component={VerificationRejectedScreen} />
      <Stack.Screen name={Routes.VerificationSuccess} component={VerificationSuccessScreen} />
      <Stack.Screen name={Routes.ParentChildren} component={ParentChildrenScreen} />
      <Stack.Screen name={Routes.ChildAcademicReport} component={ChildAcademicReportScreen} />
      <Stack.Screen name={Routes.ChildActivity} component={ChildActivityScreen} />
      <Stack.Screen name={Routes.ConnectChild} component={ConnectChildScreen} />
      <Stack.Screen name={Routes.EnterChildCode} component={EnterChildCodeScreen} />
      <Stack.Screen name={Routes.ConnectionPending} component={ConnectionPendingScreen} />
      <Stack.Screen name={Routes.ConnectionSuccess} component={ConnectionSuccessScreen} />
      <Stack.Screen name={Routes.Withdrawal} component={WithdrawalScreen} />
      <Stack.Screen name={Routes.WithdrawalSuccess} component={WithdrawalSuccessScreen} />
      <Stack.Screen name={Routes.PayoutHistory} component={PayoutHistoryScreen} />
      <Stack.Screen name={Routes.Wallet} component={WalletScreen} />
      <Stack.Screen name={Routes.Referral} component={ReferralScreen} />
      <Stack.Screen name={Routes.ReferralBalance} component={ReferralBalanceScreen} />
      <Stack.Screen name={Routes.Dashboard} component={TeacherDashboardScreen} />
      <Stack.Screen name={Routes.Settings} component={SettingsScreen} />
      <Stack.Screen name={Routes.NotificationSettings} component={NotificationSettingsScreen} />
      <Stack.Screen name={Routes.TermsOfService} component={TermsOfServiceScreen} />
      <Stack.Screen name={Routes.Support} component={SupportScreen} />
      <Stack.Screen name={Routes.HelpCenter} component={HelpCenterScreen} />
      <Stack.Screen name={Routes.ReportProblem} component={ReportProblemScreen} />
      <Stack.Screen name={Routes.AboutApp} component={AboutAppScreen} />
      <Stack.Screen name={Routes.ChangePassword} component={ChangePasswordScreen} />
      <Stack.Screen name={Routes.PasswordChanged} component={PasswordChangedScreen} />
      <Stack.Screen name={Routes.AccountManagement} component={AccountManagementScreen} />
      <Stack.Screen name={Routes.BlockedUsers} component={BlockedUsersScreen} />
      <Stack.Screen name={Routes.DeactivateReason} component={DeactivateReasonScreen} />
      <Stack.Screen name={Routes.AccountDeactivated} component={AccountDeactivatedScreen} />
      <Stack.Screen name={Routes.DeleteAccountConfirm} component={DeleteAccountConfirmScreen} />
      <Stack.Screen name={Routes.LogoutConfirm} component={LogoutConfirmScreen} options={{ presentation: 'transparentModal' }} />
      <Stack.Screen name={Routes.Achievements} component={AchievementsScreen} />
      <Stack.Screen name={Routes.CertificateList} component={CertificateListScreen} />
      <Stack.Screen name={Routes.CertificatePreview} component={CertificatePreviewScreen as any} />
      <Stack.Screen name={Routes.ExamHistory} component={ExamHistoryScreen} />
      <Stack.Screen name={Routes.ExamResult} component={ExamResultScreen as any} />
      <Stack.Screen name={Routes.DuelHistory} component={DuelHistoryScreen} />
      <Stack.Screen name={Routes.RewardHistory} component={RewardHistoryScreen} />
    </Stack.Navigator>
  );
}
