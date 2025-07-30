import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKV } from '@github/spark/hooks';
import { 
  TrendingUp,
  Users,
  Globe,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Share,
  Mail,
  MessageCircle,
  Calendar,
  Download,
  Filter,
  Search,
  ExternalLink,
  Zap,
  Crown,
  Gift
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AnalyticsData {
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

interface MarketingCampaign {
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

interface UserSegment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  engagementScore: number;
  conversionRate: number;
  criteria: string[];
}

interface ABTest {
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

export function MarketingGrowthDashboard() {
  const [analytics, setAnalytics] = useKV('marketing-analytics', null);
  const [campaigns, setCampaigns] = useKV('marketing-campaigns', []);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const mockAnalytics: AnalyticsData = {
    userEngagement: {
      dailyActiveUsers: 12450,
      monthlyActiveUsers: 45200,
      sessionDuration: 18.5,
      pageViews: 125000,
      bounceRate: 0.23
    },
    conversionMetrics: {
      signupConversion: 0.185,
      trialToSubscription: 0.42,
      freeToProUpgrade: 0.15,
      churnRate: 0.05
    },
    featureUsage: {
      notesCreated: 89500,
      aiQueriesUsed: 156000,
      templatesUsed: 23400,
      collaborationSessions: 8900,
      searchQueries: 234000
    },
    revenueMetrics: {
      monthlyRecurringRevenue: 285000,
      averageRevenuePerUser: 24.50,
      lifetimeValue: 450,
      revenueGrowth: 0.23
    }
  };

  const mockCampaigns: MarketingCampaign[] = [
    {
      id: 'campaign-1',
      name: 'AI Productivity Launch',
      type: 'email',
      status: 'active',
      impressions: 45000,
      clicks: 2250,
      conversions: 450,
      cost: 1200,
      roi: 8.5,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-01')
    },
    {
      id: 'campaign-2',
      name: 'Social Media Awareness',
      type: 'social',
      status: 'active',
      impressions: 125000,
      clicks: 3750,
      conversions: 225,
      cost: 2500,
      roi: 3.2,
      startDate: new Date('2024-01-15')
    },
    {
      id: 'campaign-3',
      name: 'Content Marketing SEO',
      type: 'content',
      status: 'completed',
      impressions: 89000,
      clicks: 5340,
      conversions: 890,
      cost: 800,
      roi: 12.3,
      startDate: new Date('2023-12-01'),
      endDate: new Date('2024-01-15')
    }
  ];

  const userSegments: UserSegment[] = [
    {
      id: 'power-users',
      name: 'Power Users',
      description: 'Heavy daily users with high engagement',
      userCount: 5600,
      engagementScore: 92,
      conversionRate: 0.85,
      criteria: ['Daily active', '>50 notes/month', 'Uses AI features']
    },
    {
      id: 'trial-users',
      name: 'Trial Users',
      description: 'Users in their trial period',
      userCount: 12300,
      engagementScore: 65,
      conversionRate: 0.42,
      criteria: ['14-day trial', 'Signed up <14 days ago']
    },
    {
      id: 'casual-users',
      name: 'Casual Users',
      description: 'Occasional users with basic usage',
      userCount: 27300,
      engagementScore: 34,
      conversionRate: 0.12,
      criteria: ['Weekly active', '<10 notes/month', 'Free plan']
    }
  ];

  const abTests: ABTest[] = [
    {
      id: 'test-1',
      name: 'Onboarding Flow Optimization',
      status: 'running',
      variants: [
        { name: 'Control', traffic: 50, conversions: 125, conversionRate: 0.125 },
        { name: 'Simplified', traffic: 50, conversions: 156, conversionRate: 0.156 }
      ],
      significance: 95.2
    },
    {
      id: 'test-2',
      name: 'Pricing Page CTA',
      status: 'completed',
      variants: [
        { name: 'Control', traffic: 50, conversions: 89, conversionRate: 0.089 },
        { name: 'Urgency Copy', traffic: 50, conversions: 134, conversionRate: 0.134 }
      ],
      significance: 98.7,
      winner: 'Urgency Copy'
    }
  ];

  useEffect(() => {
    if (!analytics) {
      setAnalytics(mockAnalytics);
    }
    if (campaigns.length === 0) {
      setCampaigns(mockCampaigns);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    format = 'number',
    icon: Icon,
    trend = 'up'
  }: {
    title: string;
    value: number;
    change?: number;
    format?: 'number' | 'currency' | 'percentage';
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
  }) => {
    const formatValue = () => {
      switch (format) {
        case 'currency':
          return formatCurrency(value);
        case 'percentage':
          return formatPercentage(value);
        default:
          return formatNumber(value);
      }
    };

    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Icon className="w-8 h-8 text-primary" />
            {change && (
              <Badge 
                variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
                className="flex items-center gap-1"
              >
                <TrendingUp className={cn(
                  "w-3 h-3",
                  trend === 'down' && "rotate-180"
                )} />
                {change > 0 ? '+' : ''}{formatPercentage(change)}
              </Badge>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold">{formatValue()}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Marketing & Growth Dashboard</h1>
          <p className="text-muted-foreground">
            Track user acquisition, engagement, and revenue metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Monthly Recurring Revenue"
              value={analytics.revenueMetrics.monthlyRecurringRevenue}
              change={analytics.revenueMetrics.revenueGrowth}
              format="currency"
              icon={TrendingUp}
              trend="up"
            />
            <MetricCard
              title="Monthly Active Users"
              value={analytics.userEngagement.monthlyActiveUsers}
              change={0.15}
              icon={Users}
              trend="up"
            />
            <MetricCard
              title="Trial to Subscription"
              value={analytics.conversionMetrics.trialToSubscription}
              change={0.08}
              format="percentage"
              icon={Target}
              trend="up"
            />
            <MetricCard
              title="Customer Churn Rate"
              value={analytics.conversionMetrics.churnRate}
              change={-0.02}
              format="percentage"
              icon={Activity}
              trend="down"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  User Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  [Interactive Chart: User Growth Over Time]
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Revenue by Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { plan: 'Professional', revenue: 165000, percentage: 58 },
                    { plan: 'Team', revenue: 85000, percentage: 30 },
                    { plan: 'Enterprise', revenue: 35000, percentage: 12 }
                  ].map((item) => (
                    <div key={item.plan} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.plan}</span>
                        <span>{formatCurrency(item.revenue)}</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage Metrics */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Feature Usage Analytics</CardTitle>
              <CardDescription>
                Understanding how users interact with key features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(analytics.featureUsage).map(([feature, usage]) => (
                  <div key={feature} className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {formatNumber(usage as number)}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Campaign Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign: MarketingCampaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-card hover:glass-elevated transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {campaign.type}
                          </Badge>
                          <Badge 
                            variant={campaign.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Impressions</span>
                        <p className="font-semibold">{formatNumber(campaign.impressions)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Clicks</span>
                        <p className="font-semibold">{formatNumber(campaign.clicks)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conversions</span>
                        <p className="font-semibold">{campaign.conversions}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ROI</span>
                        <p className="font-semibold text-green-600">{campaign.roi}x</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Click Rate</span>
                        <span>{formatPercentage(campaign.clicks / campaign.impressions)}</span>
                      </div>
                      <Progress 
                        value={(campaign.clicks / campaign.impressions) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {campaign.startDate.toLocaleDateString()} - {
                          campaign.endDate ? campaign.endDate.toLocaleDateString() : 'Ongoing'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Create New Campaign */}
          <Card className="glass-panel">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Zap className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Create New Campaign</h3>
                  <p className="text-muted-foreground">
                    Launch targeted marketing campaigns with advanced analytics
                  </p>
                </div>
                <Button className="flex items-center gap-2">
                  <Share className="w-4 h-4" />
                  New Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {userSegments.map((segment) => (
              <Card key={segment.id} className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {segment.name}
                  </CardTitle>
                  <CardDescription>{segment.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {formatNumber(segment.userCount)}
                    </div>
                    <div className="text-sm text-muted-foreground">Users</div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Engagement Score</span>
                        <span>{segment.engagementScore}/100</span>
                      </div>
                      <Progress value={segment.engagementScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Conversion Rate</span>
                        <span>{formatPercentage(segment.conversionRate)}</span>
                      </div>
                      <Progress value={segment.conversionRate * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-medium">Criteria:</p>
                      {segment.criteria.map((criterion, index) => (
                        <p key={index}>• {criterion}</p>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="space-y-6">
            {abTests.map((test) => (
              <Card key={test.id} className="glass-panel">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{test.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={test.status === 'running' ? 'default' : 'secondary'}
                        >
                          {test.status}
                        </Badge>
                        {test.significance && (
                          <Badge variant="outline">
                            {test.significance}% confidence
                          </Badge>
                        )}
                        {test.winner && (
                          <Badge className="bg-green-500">
                            <Crown className="w-3 h-3 mr-1" />
                            Winner: {test.winner}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {test.variants.map((variant, index) => (
                      <div 
                        key={variant.name} 
                        className={cn(
                          "space-y-3 p-4 rounded-lg border",
                          test.winner === variant.name ? "border-green-500 bg-green-50/50" : "border-border"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{variant.name}</h4>
                          <span className="text-sm text-muted-foreground">
                            {variant.traffic}% traffic
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Conversions</span>
                            <span className="font-medium">{variant.conversions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Conversion Rate</span>
                            <span className="font-medium">
                              {formatPercentage(variant.conversionRate)}
                            </span>
                          </div>
                        </div>

                        <Progress 
                          value={variant.conversionRate * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-panel">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Target className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Create New A/B Test</h3>
                  <p className="text-muted-foreground">
                    Test different variations to optimize conversion rates
                  </p>
                </div>
                <Button className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Start New Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Automation */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Automation
                </CardTitle>
                <CardDescription>
                  Automated email sequences and campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: 'Welcome Series', active: true, opens: '45%' },
                    { name: 'Trial Onboarding', active: true, opens: '38%' },
                    { name: 'Re-engagement', active: false, opens: '22%' }
                  ].map((automation) => (
                    <div key={automation.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{automation.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {automation.opens} open rate
                        </p>
                      </div>
                      <Badge variant={automation.active ? 'default' : 'secondary'}>
                        {automation.active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  Manage Automations
                </Button>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="w-5 h-5" />
                  Social Media Automation
                </CardTitle>
                <CardDescription>
                  Scheduled posts and social campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <Calendar className="w-12 h-12 mx-auto text-primary" />
                  <h3 className="font-semibold">Content Calendar</h3>
                  <p className="text-sm text-muted-foreground">
                    15 posts scheduled for this week
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}