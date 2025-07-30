import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMonetization } from './MonetizationProvider';
import { 
  Crown, 
  TrendingUp, 
  Users, 
  Database, 
  Brain, 
  FileText,
  CheckCircle2,
  Zap,
  Star,
  ArrowRight,
  CreditCard,
  BarChart3
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PricingCardProps {
  tier: any;
  isCurrentTier: boolean;
  onUpgrade: (tierId: string) => void;
  isLoading: boolean;
}

function PricingCard({ tier, isCurrentTier, onUpgrade, isLoading }: PricingCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className={cn(
        "relative",
        tier.isPopular && "scale-105"
      )}
    >
      <Card className={cn(
        "glass-card transition-all duration-300 hover:shadow-xl",
        isCurrentTier && "ring-2 ring-primary",
        tier.isPopular && "border-primary shadow-lg"
      )}>
        {tier.isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-3 py-1">
              <Star className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="text-center space-y-4">
          <div>
            <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
            <CardDescription className="mt-2">
              {tier.id === 'free' && "Perfect for getting started"}
              {tier.id === 'pro' && "For individuals and small teams"}
              {tier.id === 'team' && "For growing teams"}
              {tier.id === 'enterprise' && "For large organizations"}
            </CardDescription>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold">${tier.price}</span>
              <span className="text-muted-foreground">
                {tier.price > 0 ? `/${tier.billingPeriod}` : ''}
              </span>
            </div>
            {tier.price > 0 && (
              <p className="text-sm text-muted-foreground">
                Save 20% with annual billing
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            {tier.features.map((feature: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={() => onUpgrade(tier.id)}
            disabled={isCurrentTier || isLoading}
            variant={tier.isPopular ? "default" : "outline"}
            className="w-full"
          >
            {isCurrentTier ? (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Current Plan
              </>
            ) : (
              <>
                {tier.id === 'free' ? 'Get Started' : 'Upgrade'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UsageCard({ title, current, limit, icon: Icon, unit = '' }: {
  title: string;
  current: number;
  limit: number;
  icon: any;
  unit?: string;
}) {
  const percentage = limit === -1 ? 0 : Math.min((current / limit) * 100, 100);
  const isUnlimited = limit === -1;
  
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{title}</span>
          </div>
          <Badge variant="outline">
            {isUnlimited ? 'Unlimited' : `${current}${unit} / ${limit}${unit}`}
          </Badge>
        </div>

        {!isUnlimited && (
          <div className="space-y-2">
            <Progress value={percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{current}{unit} used</span>
              <span>{limit - current}{unit} remaining</span>
            </div>
          </div>
        )}

        {isUnlimited && (
          <div className="text-center py-2">
            <span className="text-sm text-green-600 font-medium">Unlimited usage</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SubscriptionManagement() {
  const {
    currentTier,
    subscription,
    usage,
    tiers,
    isLoading,
    upgradeTier,
    cancelSubscription,
    getUsageAnalytics
  } = useMonetization();

  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getUsageAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleUpgrade = async (tierId: string) => {
    try {
      await upgradeTier(tierId);
      toast.success('Subscription updated successfully!');
    } catch (error) {
      toast.error('Upgrade failed', { description: error.message });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription();
    } catch (error) {
      toast.error('Cancellation failed', { description: error.message });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your Cortex subscription, track usage, and unlock powerful features
          to supercharge your productivity.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan */}
          <Card className="glass-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentTier?.name}</h3>
                  <p className="text-muted-foreground">
                    {currentTier?.price === 0 
                      ? 'Free forever' 
                      : `$${currentTier?.price}/${currentTier?.billingPeriod}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={subscription?.status === 'active' ? 'default' : 'destructive'}
                  >
                    {subscription?.status?.toUpperCase()}
                  </Badge>
                  {subscription?.currentPeriodEnd && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {currentTier?.id !== 'enterprise' && (
                <Button onClick={() => setActiveTab('plans')} className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}

              {currentTier?.id !== 'free' && (
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancel Subscription
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Usage Overview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Usage Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <UsageCard
                title="Notes"
                current={usage.notes}
                limit={currentTier?.limits.notes || 0}
                icon={FileText}
              />
              <UsageCard
                title="Tasks"
                current={usage.tasks}
                limit={currentTier?.limits.tasks || 0}
                icon={CheckCircle2}
              />
              <UsageCard
                title="Storage"
                current={usage.storage}
                limit={currentTier?.limits.storage || 0}
                icon={Database}
                unit="MB"
              />
              <UsageCard
                title="AI Queries"
                current={usage.aiQueries}
                limit={currentTier?.limits.aiQueries || 0}
                icon={Brain}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card hover:glass-elevated transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Billing History</h3>
                <p className="text-sm text-muted-foreground">View past invoices</p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-elevated transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Team Management</h3>
                <p className="text-sm text-muted-foreground">Manage team members</p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glass-elevated transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">API Access</h3>
                <p className="text-sm text-muted-foreground">Manage API keys</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Choose Your Plan</h2>
            <p className="text-muted-foreground">
              Scale your productivity with the right plan for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                isCurrentTier={currentTier?.id === tier.id}
                onUpgrade={handleUpgrade}
                isLoading={isLoading}
              />
            ))}
          </div>

          <Card className="glass-panel">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">Need a custom solution?</h3>
                <p className="text-muted-foreground">
                  Contact our sales team for enterprise pricing and custom features
                </p>
                <Button variant="outline">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analytics.trends).map(([key, data]: [string, any]) => (
                  <Card key={key} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{key}</span>
                        <Badge variant="outline" className="text-green-600">
                          {data.trend}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">{data.current}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}