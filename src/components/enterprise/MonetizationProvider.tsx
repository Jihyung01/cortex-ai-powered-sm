import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface SubscriptionTier {
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

interface Usage {
  notes: number;
  tasks: number;
  storage: number;
  teamMembers: number;
  aiQueries: number;
  resetDate: Date;
}

interface Subscription {
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

interface MonetizationContextType {
  currentTier: SubscriptionTier | null;
  subscription: Subscription | null;
  usage: Usage;
  tiers: SubscriptionTier[];
  isLoading: boolean;
  canUseFeature: (feature: string) => boolean;
  hasReachedLimit: (limitType: keyof Usage) => boolean;
  getRemainingUsage: (limitType: keyof Usage) => number;
  upgradeTier: (tierId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  trackUsage: (type: keyof Usage, amount?: number) => Promise<void>;
  getUsageAnalytics: () => Promise<any>;
}

const MonetizationContext = createContext<MonetizationContextType | null>(null);

/**
 * Comprehensive monetization system with freemium model and usage tracking
 * Handles subscription management, billing, and feature gating
 */
export function MonetizationProvider({ children }: { children: ReactNode }) {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage>({
    notes: 0,
    tasks: 0,
    storage: 0,
    teamMembers: 1,
    aiQueries: 0,
    resetDate: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);

  const [subscriptionData, setSubscriptionData] = useKV('subscription-data', null);
  const [usageData, setUsageData] = useKV('usage-data', null);

  // Subscription tiers configuration
  const tiers: SubscriptionTier[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingPeriod: 'monthly',
      features: [
        'Up to 50 notes',
        'Basic task management',
        '100MB storage',
        'Basic AI assistance (10 queries/month)',
        'Mobile app access',
        'Basic templates'
      ],
      limits: {
        notes: 50,
        tasks: 100,
        storage: 100,
        teamMembers: 1,
        aiQueries: 10
      }
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 12,
      billingPeriod: 'monthly',
      features: [
        'Unlimited notes & tasks',
        '10GB storage',
        'Advanced AI features (500 queries/month)',
        'Premium templates',
        'Advanced analytics',
        'Priority support',
        'Custom integrations',
        'Advanced search',
        'Export capabilities'
      ],
      limits: {
        notes: -1, // unlimited
        tasks: -1,
        storage: 10240,
        teamMembers: 1,
        aiQueries: 500
      },
      isPopular: true
    },
    {
      id: 'team',
      name: 'Team',
      price: 25,
      billingPeriod: 'monthly',
      features: [
        'Everything in Professional',
        'Up to 10 team members',
        '100GB shared storage',
        'Team collaboration features',
        'Advanced AI (2000 queries/month)',
        'Admin dashboard',
        'Team analytics',
        'SSO integration',
        'Advanced permissions'
      ],
      limits: {
        notes: -1,
        tasks: -1,
        storage: 102400,
        teamMembers: 10,
        aiQueries: 2000
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      billingPeriod: 'monthly',
      features: [
        'Everything in Team',
        'Unlimited team members',
        'Unlimited storage',
        'Unlimited AI queries',
        'White-label options',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees',
        'Advanced security',
        'Audit logs',
        'Custom contracts'
      ],
      limits: {
        notes: -1,
        tasks: -1,
        storage: -1,
        teamMembers: -1,
        aiQueries: -1
      }
    }
  ];

  useEffect(() => {
    initializeMonetization();
  }, []);

  const initializeMonetization = async () => {
    try {
      setIsLoading(true);

      // Load subscription data
      if (subscriptionData) {
        setSubscription(subscriptionData);
        const tier = tiers.find(t => t.id === subscriptionData.tierId);
        setCurrentTier(tier || tiers[0]);
      } else {
        // Default to free tier
        setCurrentTier(tiers[0]);
        const freeSubscription: Subscription = {
          id: 'free-sub',
          userId: 'current-user',
          tierId: 'free',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        setSubscription(freeSubscription);
        await setSubscriptionData(freeSubscription);
      }

      // Load usage data
      if (usageData) {
        setUsage(usageData);
      } else {
        const initialUsage: Usage = {
          notes: 0,
          tasks: 0,
          storage: 0,
          teamMembers: 1,
          aiQueries: 0,
          resetDate: new Date()
        };
        setUsage(initialUsage);
        await setUsageData(initialUsage);
      }

      // Check if usage needs to be reset
      await checkUsageReset();
    } catch (error) {
      console.error('Monetization initialization failed:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUsageReset = async () => {
    if (!usage.resetDate) return;

    const now = new Date();
    const resetDate = new Date(usage.resetDate);
    const shouldReset = now.getTime() - resetDate.getTime() > 30 * 24 * 60 * 60 * 1000; // 30 days

    if (shouldReset) {
      const resetUsage: Usage = {
        notes: usage.notes,
        tasks: usage.tasks,
        storage: usage.storage,
        teamMembers: usage.teamMembers,
        aiQueries: 0, // Reset AI queries monthly
        resetDate: now
      };

      setUsage(resetUsage);
      await setUsageData(resetUsage);
      
      toast.success('Monthly usage limits reset');
    }
  };

  const canUseFeature = (feature: string): boolean => {
    if (!currentTier) return false;
    return currentTier.features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    );
  };

  const hasReachedLimit = (limitType: keyof Usage): boolean => {
    if (!currentTier) return true;
    
    const limit = currentTier.limits[limitType];
    if (limit === -1) return false; // Unlimited
    
    return usage[limitType] >= limit;
  };

  const getRemainingUsage = (limitType: keyof Usage): number => {
    if (!currentTier) return 0;
    
    const limit = currentTier.limits[limitType];
    if (limit === -1) return Infinity; // Unlimited
    
    return Math.max(0, limit - usage[limitType]);
  };

  const trackUsage = async (type: keyof Usage, amount: number = 1) => {
    try {
      const newUsage = {
        ...usage,
        [type]: usage[type] + amount
      };

      setUsage(newUsage);
      await setUsageData(newUsage);

      // Check if user has exceeded limits
      if (hasReachedLimit(type) && currentTier?.id === 'free') {
        toast.warning(`You've reached your ${type} limit`, {
          description: 'Upgrade to continue using this feature',
          action: {
            label: 'Upgrade',
            onClick: () => {
              // Trigger upgrade flow
              console.log('Upgrade triggered');
            }
          }
        });
      }

      // Log usage for analytics
      await logUsageEvent(type, amount);
    } catch (error) {
      console.error('Usage tracking failed:', error);
    }
  };

  const upgradeTier = async (tierId: string) => {
    try {
      setIsLoading(true);

      const newTier = tiers.find(t => t.id === tierId);
      if (!newTier) throw new Error('Invalid tier');

      // In production, this would integrate with Stripe or similar
      const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        userId: subscription?.userId || 'current-user',
        tierId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        customerId: `cus-${Date.now()}`
      };

      setSubscription(newSubscription);
      setCurrentTier(newTier);
      await setSubscriptionData(newSubscription);

      // Log subscription change
      await logSubscriptionEvent('upgraded', {
        fromTier: currentTier?.id,
        toTier: tierId,
        price: newTier.price
      });

      toast.success(`Successfully upgraded to ${newTier.name}!`, {
        description: 'Your new features are now available'
      });

    } catch (error) {
      console.error('Upgrade failed:', error);
      toast.error('Upgrade failed', { description: error.message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      if (!subscription) throw new Error('No active subscription');

      const canceledSubscription = {
        ...subscription,
        status: 'canceled' as const,
        canceledAt: new Date()
      };

      setSubscription(canceledSubscription);
      await setSubscriptionData(canceledSubscription);

      await logSubscriptionEvent('canceled', {
        tierId: currentTier?.id,
        reason: 'user_requested'
      });

      toast.success('Subscription canceled', {
        description: 'You can continue using premium features until the end of your billing period'
      });

    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Cancellation failed', { description: error.message });
      throw error;
    }
  };

  const getUsageAnalytics = async () => {
    try {
      // In production, this would fetch from analytics service
      return {
        trends: {
          notes: { current: usage.notes, trend: '+15%' },
          tasks: { current: usage.tasks, trend: '+8%' },
          storage: { current: usage.storage, trend: '+22%' },
          aiQueries: { current: usage.aiQueries, trend: '+45%' }
        },
        recommendations: [
          'You\'re using 80% of your note limit. Consider upgrading to Professional.',
          'Your AI query usage has increased significantly this month.',
          'Team collaboration features could help with your workflow.'
        ],
        forecast: {
          willExceedLimits: ['aiQueries'],
          suggestedTier: 'pro'
        }
      };
    } catch (error) {
      console.error('Analytics fetch failed:', error);
      return null;
    }
  };

  // Helper functions
  const logUsageEvent = async (type: string, amount: number) => {
    try {
      const event = {
        type: 'usage_tracked',
        usageType: type,
        amount,
        timestamp: new Date().toISOString(),
        userId: subscription?.userId,
        tierId: currentTier?.id
      };

      // In production, send to analytics service
      console.log('Usage Event:', event);
    } catch (error) {
      console.error('Usage logging failed:', error);
    }
  };

  const logSubscriptionEvent = async (action: string, data: any) => {
    try {
      const event = {
        type: 'subscription_event',
        action,
        data,
        timestamp: new Date().toISOString(),
        userId: subscription?.userId
      };

      // In production, send to analytics service
      console.log('Subscription Event:', event);
    } catch (error) {
      console.error('Subscription logging failed:', error);
    }
  };

  const contextValue: MonetizationContextType = {
    currentTier,
    subscription,
    usage,
    tiers,
    isLoading,
    canUseFeature,
    hasReachedLimit,
    getRemainingUsage,
    upgradeTier,
    cancelSubscription,
    trackUsage,
    getUsageAnalytics
  };

  return (
    <MonetizationContext.Provider value={contextValue}>
      {children}
    </MonetizationContext.Provider>
  );
}

export function useMonetization() {
  const context = useContext(MonetizationContext);
  if (!context) {
    throw new Error('useMonetization must be used within a MonetizationProvider');
  }
  return context;
}