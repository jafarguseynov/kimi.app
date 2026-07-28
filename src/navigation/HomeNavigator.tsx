import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { Routes } from '../constants/routes';
import HomeScreen from '../screens/home/HomeScreen';
import DailyMissionsScreen from '../screens/home/DailyMissionsScreen';
import AIStudyPathScreen from '../screens/home/AIStudyPathScreen';
import SpinWheelScreen from '../screens/home/SpinWheelScreen';
import CoinShopScreen from '../screens/home/CoinShopScreen';
import AchievementsScreen from '../screens/home/AchievementsScreen';
import LeaderboardScreen from '../screens/home/LeaderboardScreen';
import LeaderboardDetailScreen from '../screens/home/LeaderboardDetailScreen';
import LiveActivityScreen from '../screens/home/LiveActivityScreen';
import NewsScreen from '../screens/home/NewsScreen';
import MotivationReminderScreen from '../screens/home/MotivationReminderScreen';
import TopicProgressScreen from '../screens/home/TopicProgressScreen';
import ReviewTopicsScreen from '../screens/home/ReviewTopicsScreen';
import AIPracticeBuilderScreen from '../screens/home/AIPracticeBuilderScreen';
import WeakTopicsScreen from '../screens/home/WeakTopicsScreen';
import FavoritesScreen from '../screens/bookmarks/FavoritesScreen';
import RecentlyViewedScreen from '../screens/bookmarks/RecentlyViewedScreen';
import LeagueScreen from '../screens/home/LeagueScreen';
import SchoolRankingScreen from '../screens/home/SchoolRankingScreen';
import SchoolSearchScreen from '../screens/home/SchoolSearchScreen';
import SchoolDetailScreen from '../screens/home/SchoolDetailScreen';
import NotificationScreen from '../screens/home/NotificationScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import LanguageSelectScreen from '../screens/settings/LanguageSelectScreen';
import TwoFactorScreen from '../screens/settings/TwoFactorScreen';
import BlockedUsersScreen from '../screens/settings/BlockedUsersScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import PasswordChangedScreen from '../screens/settings/PasswordChangedScreen';
import HelpCenterScreen from '../screens/settings/HelpCenterScreen';
import SupportScreen from '../screens/settings/SupportScreen';
import ReportProblemScreen from '../screens/settings/ReportProblemScreen';
import TermsOfServiceScreen from '../screens/settings/TermsOfServiceScreen';
import AboutAppScreen from '../screens/settings/AboutAppScreen';
import PaymentMethodScreen from '../screens/payment/PaymentMethodScreen';
import CardPaymentScreen from '../screens/payment/CardPaymentScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import PaymentFailedScreen from '../screens/payment/PaymentFailedScreen';
import SubscriptionScreen from '../screens/payment/SubscriptionScreen';
import PlansScreen from '../screens/payment/PlansScreen';
import TeacherProfileSetupScreen from '../screens/profile/TeacherProfileSetupScreen';
import PlanCompareScreen from '../screens/payment/PlanCompareScreen';
import PremiumBenefitsScreen from '../screens/payment/PremiumBenefitsScreen';
import SubscriptionRenewScreen from '../screens/payment/SubscriptionRenewScreen';
import SubscriptionCancelScreen from '../screens/payment/SubscriptionCancelScreen';
import FriendsScreen from '../screens/social/FriendsScreen';
import AllOpenRequestsScreen from '../screens/home/AllOpenRequestsScreen';
import LessonRequestDetailScreen from '../screens/home/LessonRequestDetailScreen';
import MyRequestsScreen from '../screens/home/MyRequestsScreen';
import AIRecommendationsScreen from '../screens/ai/AIRecommendationsScreen';
import SearchScreen from '../screens/search/SearchScreen';
import SmartFeedScreen from '../screens/home/SmartFeedScreen';
import StreakProtectionScreen from '../screens/home/StreakProtectionScreen';
import StreakDashboardScreen from '../screens/home/StreakDashboardScreen';
import StreakDetailScreen from '../screens/home/StreakDetailScreen';
import StreakWarningScreen from '../screens/home/StreakWarningScreen';
import StreakRecoveryScreen from '../screens/home/StreakRecoveryScreen';
import TeacherBadgesScreen from '../screens/profile/TeacherBadgesScreen';
import TeacherLevelScreen from '../screens/profile/TeacherLevelScreen';
import VerifiedTeacherScreen from '../screens/profile/VerifiedTeacherScreen';
import TopTeachersLeaderboardScreen from '../screens/profile/TopTeachersLeaderboardScreen';
import MissionProgressScreen from '../screens/home/MissionProgressScreen';
import MissionStartScreen from '../screens/home/MissionStartScreen';
import PerformanceSummaryScreen from '../screens/home/PerformanceSummaryScreen';
import QuestionActivityScreen from '../screens/home/QuestionActivityScreen';
import ImprovementTipsScreen from '../screens/home/ImprovementTipsScreen';
import WeeklyReportScreen from '../screens/home/WeeklyReportScreen';
import FindFriendScreen from '../screens/home/FindFriendScreen';
import MyFriendsScreen from '../screens/social/MyFriendsScreen';
import TeacherProfilePremiumScreen from '../screens/profile/TeacherProfilePremiumScreen';
import FriendsLeaderboardScreen from '../screens/social/FriendsLeaderboardScreen';
import InviteFriendsScreen from '../screens/social/InviteFriendsScreen';
import NotificationPrimingScreen from '../screens/onboarding/NotificationPrimingScreen';
import ClassGradeCalculatorScreen from '../screens/calculators/ClassGradeCalculatorScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name={Routes.HomeMain} component={HomeScreen} />
      <Stack.Screen name={Routes.DailyMissions} component={DailyMissionsScreen} />
      <Stack.Screen name={Routes.AIStudyPath} component={AIStudyPathScreen} />
      <Stack.Screen name={Routes.SpinWheel} component={SpinWheelScreen} />
      <Stack.Screen name={Routes.CoinShop} component={CoinShopScreen} />
      <Stack.Screen name={Routes.Achievements} component={AchievementsScreen} />
      <Stack.Screen name={Routes.Leaderboard} component={LeaderboardScreen} />
      <Stack.Screen name={Routes.LeaderboardDetail} component={LeaderboardDetailScreen} />
      <Stack.Screen name={Routes.LiveActivity} component={LiveActivityScreen} />
      <Stack.Screen name={Routes.News} component={NewsScreen} />
      <Stack.Screen name={Routes.MotivationReminder} component={MotivationReminderScreen} />
      <Stack.Screen name={Routes.TopicProgress} component={TopicProgressScreen} />
      <Stack.Screen name={Routes.ReviewTopics} component={ReviewTopicsScreen} />
      <Stack.Screen name={Routes.AIPracticeBuilder} component={AIPracticeBuilderScreen} />
      <Stack.Screen name={Routes.WeakTopics} component={WeakTopicsScreen} />
      <Stack.Screen name={Routes.Favorites} component={FavoritesScreen} />
      <Stack.Screen name={Routes.RecentlyViewed} component={RecentlyViewedScreen} />
      <Stack.Screen name={Routes.League} component={LeagueScreen} />
      <Stack.Screen name={Routes.SchoolRanking} component={SchoolRankingScreen} />
      <Stack.Screen name={Routes.SchoolSearch} component={SchoolSearchScreen} />
      <Stack.Screen name={Routes.SchoolDetail} component={SchoolDetailScreen} />
      <Stack.Screen name={Routes.Notifications} component={NotificationScreen} />
      <Stack.Screen name={Routes.Settings} component={SettingsScreen} />
      <Stack.Screen name={Routes.EditProfile} component={EditProfileScreen} />
      <Stack.Screen name={Routes.NotificationSettings} component={NotificationSettingsScreen} />
      <Stack.Screen name={Routes.LanguageSelect} component={LanguageSelectScreen} />
      <Stack.Screen name={Routes.TwoFactor} component={TwoFactorScreen} />
      <Stack.Screen name={Routes.BlockedUsers} component={BlockedUsersScreen} />
      <Stack.Screen name={Routes.ChangePassword} component={ChangePasswordScreen} />
      <Stack.Screen name={Routes.PasswordChanged} component={PasswordChangedScreen} />
      <Stack.Screen name={Routes.HelpCenter} component={HelpCenterScreen} />
      <Stack.Screen name={Routes.Support} component={SupportScreen} />
      <Stack.Screen name={Routes.ReportProblem} component={ReportProblemScreen} />
      <Stack.Screen name={Routes.TermsOfService} component={TermsOfServiceScreen} />
      <Stack.Screen name={Routes.AboutApp} component={AboutAppScreen} />
      <Stack.Screen name={Routes.PaymentMethod} component={PaymentMethodScreen} />
      <Stack.Screen name={Routes.CardPayment} component={CardPaymentScreen} />
      <Stack.Screen name={Routes.PaymentSuccess} component={PaymentSuccessScreen} />
      <Stack.Screen name={Routes.PaymentFailed} component={PaymentFailedScreen} />
      <Stack.Screen name={Routes.Subscription} component={SubscriptionScreen} />
      <Stack.Screen name={Routes.Plans} component={PlansScreen} />
      <Stack.Screen name={Routes.TeacherProfileSetup} component={TeacherProfileSetupScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name={Routes.PlanCompare} component={PlanCompareScreen} />
      <Stack.Screen name={Routes.PremiumBenefits} component={PremiumBenefitsScreen} />
      <Stack.Screen name={Routes.SubscriptionRenew} component={SubscriptionRenewScreen} />
      <Stack.Screen name={Routes.SubscriptionCancel} component={SubscriptionCancelScreen} />
      <Stack.Screen name={Routes.Friends} component={FriendsScreen} />
      <Stack.Screen name={Routes.AllOpenRequests} component={AllOpenRequestsScreen} />
      <Stack.Screen name={Routes.LessonRequestDetail} component={LessonRequestDetailScreen} />
      <Stack.Screen name={Routes.MyRequests} component={MyRequestsScreen} />
      <Stack.Screen name={Routes.AIRecommendations} component={AIRecommendationsScreen} />
      <Stack.Screen name={Routes.Search} component={SearchScreen} />
      <Stack.Screen name={Routes.SmartFeed} component={SmartFeedScreen} />
      <Stack.Screen name={Routes.StreakProtection} component={StreakProtectionScreen} />
      <Stack.Screen name={Routes.TeacherBadges} component={TeacherBadgesScreen} />
      <Stack.Screen name={Routes.TeacherLevel} component={TeacherLevelScreen} />
      <Stack.Screen name={Routes.VerifiedTeacher} component={VerifiedTeacherScreen} />
      <Stack.Screen name={Routes.TopTeachersLeaderboard} component={TopTeachersLeaderboardScreen} />
      <Stack.Screen name={Routes.StreakDashboard} component={StreakDashboardScreen} />
      <Stack.Screen name={Routes.StreakDetail} component={StreakDetailScreen} />
      <Stack.Screen name={Routes.StreakWarning} component={StreakWarningScreen} options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <Stack.Screen name={Routes.StreakRecovery} component={StreakRecoveryScreen} options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <Stack.Screen name={Routes.MissionProgress} component={MissionProgressScreen} />
      <Stack.Screen name={Routes.MissionStart} component={MissionStartScreen} />
      <Stack.Screen name={Routes.PerformanceSummary} component={PerformanceSummaryScreen} />
      <Stack.Screen name={Routes.QuestionActivity} component={QuestionActivityScreen} />
      <Stack.Screen name={Routes.ImprovementTips} component={ImprovementTipsScreen} />
      <Stack.Screen name={Routes.WeeklyReport} component={WeeklyReportScreen} />
      <Stack.Screen name={Routes.FindFriend} component={FindFriendScreen} />
      <Stack.Screen name={Routes.MyFriends} component={MyFriendsScreen} />
      <Stack.Screen name={Routes.TeacherProfilePremium} component={TeacherProfilePremiumScreen} />
      <Stack.Screen name={Routes.FriendsLeaderboard} component={FriendsLeaderboardScreen} />
      <Stack.Screen name={Routes.InviteFriends} component={InviteFriendsScreen} />
      <Stack.Screen name={Routes.NotificationPriming} component={NotificationPrimingScreen} options={{ presentation: 'modal' }} />
      {/* Home-dan açılan sinif qiymət kalkulyatoru — Home stack-də ki, geri Home-a qayıtsın */}
      <Stack.Screen name={Routes.ClassGradeCalc} component={ClassGradeCalculatorScreen} />
    </Stack.Navigator>
  );
}
