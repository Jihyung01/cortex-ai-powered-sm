// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  mfaEnabled: boolean;
  ssoProvider?: string;
  lastLoginAt: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaToken?: string;
  rememberMe?: boolean;
}

// Monetization Types
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: {
    notes: number;
    tasks: number;
    storage: number; // in MB
    teamMembers: number;
    aiQueries: number;
  };
  isPopular?: boolean;
}

export interface Usage {
  notes: number;
  tasks: number;
  storage: number;
  teamMembers: number;
  aiQueries: number;
  resetDate: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  trialEnd?: Date;
  customerId?: string;
}

// Marketing & Analytics Types
export interface AnalyticsData {
  userEngagement: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    sessionDuration: number;
    pageViews: number;
    bounceRate: number;
  };
  conversionMetrics: {
    signupConversion: number;
    trialToSubscription: number;
    freeToProUpgrade: number;
    churnRate: number;
  };
  featureUsage: {
    notesCreated: number;
    aiQueriesUsed: number;
    templatesUsed: number;
    collaborationSessions: number;
    searchQueries: number;
  };
  revenueMetrics: {
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    lifetimeValue: number;
    revenueGrowth: number;
  };
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'content' | 'paid';
  status: 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  roi: number;
  startDate: Date;
  endDate?: Date;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  engagementScore: number;
  conversionRate: number;
  criteria: string[];
}

export interface ABTest {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'paused';
  variants: {
    name: string;
    traffic: number;
    conversions: number;
    conversionRate: number;
  }[];
  significance: number;
  winner?: string;
}

// Onboarding Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

export interface UserProgress {
  currentStep: number;
  completedSteps: string[];
  skippedSteps: string[];
  startedAt: Date;
  completedAt?: Date;
}

// Help Center Types
export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  rating: number;
  lastUpdated: Date;
  estimatedReadTime: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  lastResponse?: Date;
}