// Enterprise Authentication & Security
export { AuthenticationProvider, useAuth } from './AuthenticationProvider';
export { EnterpriseLoginForm } from './EnterpriseLoginForm';

// Monetization & Subscription Management
export { MonetizationProvider, useMonetization } from './MonetizationProvider';
export { SubscriptionManagement } from './SubscriptionManagement';

// User Experience & Onboarding
export { InteractiveOnboarding } from './InteractiveOnboarding';
export { ComprehensiveHelpCenter } from './ComprehensiveHelpCenter';

// Marketing & Growth
export { MarketingGrowthDashboard } from './MarketingGrowthDashboard';

// Re-export types for external use
export type {
  // Auth types
  User,
  AuthState,
  LoginCredentials,
  
  // Monetization types
  SubscriptionTier,
  Usage,
  Subscription,
  
  // Marketing types
  AnalyticsData,
  MarketingCampaign,
  UserSegment,
  ABTest
} from './types';