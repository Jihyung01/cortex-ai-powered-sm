import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ChartBarIcon, 
  CalendarDaysIcon, 
  TrendingUpIcon, 
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';
import { useKV } from '@github/spark/hooks';
import { cn } from '@/lib/utils';
import { InsightsPanel } from './analytics/InsightsPanel';
import { KPIWidgets } from './analytics/KPIWidgets';
import { ReportBuilder } from './analytics/ReportBuilder';
import { DataVisualization } from './analytics/DataVisualization';
import { PredictiveAnalytics } from './analytics/PredictiveAnalytics';
import { springPresets } from '@/hooks/use-motion';

interface AnalyticsData {
  productivity: Array<{
    date: string;
    tasks: number;
    notes: number;
    focus: number;
    collaboration: number;
  }>;
  timeDistribution: Array<{
    category: string;
    value: number;
    color: string;
  }>;
  burnoutRisk: {
    score: number;
    factors: string[];
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  goalProgress: Array<{
    goal: string;
    progress: number;
    target: number;
    probability: number;
  }>;
  patterns: {
    peakHours: string[];
    lowEnergyPeriods: string[];
    optimalWorkDuration: number;
    breakFrequency: number;
  };
}

export function AnalyticsView() {
  const [analyticsData, setAnalyticsData] = useKV<AnalyticsData>('analytics-data', {
    productivity: [],
    timeDistribution: [],
    burnoutRisk: { score: 0, factors: [], trend: 'stable' },
    goalProgress: [],
    patterns: {
      peakHours: [],
      lowEnergyPeriods: [],
      optimalWorkDuration: 0,
      breakFrequency: 0
    }
  });
  
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [activeView, setActiveView] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insights, setInsights] = useState<Array<{ type: string; message: string; priority: 'high' | 'medium' | 'low' }>>([]);

  // Generate mock data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const productivity = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tasks: Math.floor(Math.random() * 15) + 5,
        notes: Math.floor(Math.random() * 10) + 3,
        focus: Math.floor(Math.random() * 8) + 2,
        collaboration: Math.floor(Math.random() * 6) + 1
      }));

      const timeDistribution = [
        { category: 'Deep Work', value: 35, color: '#6366f1' },
        { category: 'Meetings', value: 25, color: '#8b5cf6' },
        { category: 'Planning', value: 15, color: '#06b6d4' },
        { category: 'Communication', value: 15, color: '#10b981' },
        { category: 'Breaks', value: 10, color: '#f59e0b' }
      ];

      const burnoutRisk = {
        score: Math.floor(Math.random() * 100),
        factors: ['High workload', 'Long hours', 'Few breaks'],
        trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as any
      };

      const goalProgress = [
        { goal: 'Complete Project Alpha', progress: 75, target: 100, probability: 85 },
        { goal: 'Learn New Technology', progress: 45, target: 100, probability: 70 },
        { goal: 'Improve Team Collaboration', progress: 60, target: 100, probability: 90 }
      ];

      const patterns = {
        peakHours: ['9:00 AM', '2:00 PM', '4:00 PM'],
        lowEnergyPeriods: ['12:00 PM', '3:00 PM'],
        optimalWorkDuration: 90,
        breakFrequency: 25
      };

      setAnalyticsData({
        productivity,
        timeDistribution,
        burnoutRisk,
        goalProgress,
        patterns
      });
    };

    if (analyticsData.productivity.length === 0) {
      generateMockData();
    }
  }, [analyticsData.productivity.length, setAnalyticsData]);

  // Generate AI insights
  useEffect(() => {
    const generateInsights = () => {
      const newInsights = [
        {
          type: 'productivity',
          message: 'Your productivity peaks between 9-11 AM. Consider scheduling important tasks during this time.',
          priority: 'medium' as const
        },
        {
          type: 'burnout',
          message: 'Burnout risk is elevated. Consider taking more breaks and reducing workload.',
          priority: 'high' as const
        },
        {
          type: 'collaboration',
          message: 'Team collaboration has improved by 15% this month. Great progress!',
          priority: 'low' as const
        }
      ];
      setInsights(newInsights);
    };

    generateInsights();
  }, [analyticsData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const filteredProductivityData = useMemo(() => {
    const now = new Date();
    const daysToShow = selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : 90;
    return analyticsData.productivity.slice(-daysToShow);
  }, [analyticsData.productivity, selectedTimeRange]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Header */}
      <motion.div 
        className="p-6 pb-4 border-b border-border/40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive productivity analysis and AI-powered recommendations
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32 glass-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="glass-card"
            >
              <ArrowPathIcon className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Insights Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, ...springPresets.gentle }}
            >
              <Badge 
                variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}
                className="glass-card"
              >
                {insight.priority === 'high' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                {insight.message}
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto scrollbar-thin">
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 glass-card">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4" />
              Predictive
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={springPresets.smooth}
                className="space-y-6"
              >
                {/* KPI Widgets */}
                <KPIWidgets 
                  data={analyticsData}
                  timeRange={selectedTimeRange}
                />

                {/* Main Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Productivity Trends */}
                  <Card className="glass-card card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUpIcon className="w-5 h-5 text-primary" />
                        Productivity Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={filteredProductivityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 240)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="oklch(0.45 0.02 270)"
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis stroke="oklch(0.45 0.02 270)" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              backdropFilter: 'blur(16px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '12px'
                            }}
                          />
                          <Area type="monotone" dataKey="tasks" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="notes" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="focus" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Time Distribution */}
                  <Card className="glass-card card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5 text-secondary" />
                        Time Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData.timeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analyticsData.timeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {analyticsData.timeDistribution.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-sm" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.category}: {item.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Burnout Risk Assessment */}
                  <Card className="glass-card card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
                        Burnout Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Risk Score</span>
                          <span className={cn(
                            "text-sm font-bold",
                            analyticsData.burnoutRisk.score > 70 ? "text-destructive" :
                            analyticsData.burnoutRisk.score > 40 ? "text-yellow-600" : "text-green-600"
                          )}>
                            {analyticsData.burnoutRisk.score}/100
                          </span>
                        </div>
                        <Progress 
                          value={analyticsData.burnoutRisk.score} 
                          className="h-3"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Risk Factors:</span>
                        {analyticsData.burnoutRisk.factors.map((factor, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Goal Progress */}
                  <Card className="glass-card card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5 text-accent" />
                        Goal Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analyticsData.goalProgress.map((goal, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{goal.goal}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {goal.progress}/{goal.target}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {goal.probability}% likely
                              </Badge>
                            </div>
                          </div>
                          <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="insights">
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={springPresets.smooth}
              >
                <InsightsPanel 
                  data={analyticsData}
                  timeRange={selectedTimeRange}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="reports">
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={springPresets.smooth}
              >
                <ReportBuilder 
                  data={analyticsData}
                  timeRange={selectedTimeRange}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="visualization">
              <motion.div
                key="visualization"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={springPresets.smooth}
              >
                <DataVisualization 
                  data={analyticsData}
                  timeRange={selectedTimeRange}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="predictive">
              <motion.div
                key="predictive"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={springPresets.smooth}
              >
                <PredictiveAnalytics 
                  data={analyticsData}
                  timeRange={selectedTimeRange}
                />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}