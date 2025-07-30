import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LightBulbIcon, 
  ExclamationTriangleIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  FireIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { springPresets } from '@/hooks/use-motion';

interface InsightsPanelProps {
  data: any;
  timeRange: string;
}

interface AIInsight {
  id: string;
  type: 'productivity' | 'burnout' | 'optimization' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
  data?: any;
}

export function InsightsPanel({ data, timeRange }: InsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate AI insights based on data
  useEffect(() => {
    const generateInsights = async () => {
      setIsAnalyzing(true);
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'productivity',
          title: 'Peak Performance Window Detected',
          description: 'Your productivity peaks consistently between 9-11 AM with 40% higher task completion rates.',
          priority: 'high',
          confidence: 92,
          impact: 'high',
          actionable: true,
          recommendations: [
            'Schedule your most important tasks between 9-11 AM',
            'Block this time for deep work activities',
            'Avoid meetings during peak hours when possible'
          ],
          data: {
            peakHours: ['9:00 AM', '10:00 AM', '11:00 AM'],
            efficiency: [85, 92, 88, 75, 70, 65, 72, 68]
          }
        },
        {
          id: '2',
          type: 'burnout',
          title: 'Elevated Burnout Risk Detected',
          description: 'Analysis shows increasing stress patterns and declining break frequency over the past 2 weeks.',
          priority: 'high',
          confidence: 78,
          impact: 'high',
          actionable: true,
          recommendations: [
            'Take a 15-minute break every 90 minutes',
            'Consider reducing workload by 20% this week',
            'Schedule a wellness day within the next 5 days',
            'Implement meditation or mindfulness practices'
          ],
          data: {
            riskScore: 72,
            trend: 'increasing',
            factors: ['Extended work hours', 'Reduced break time', 'High task complexity']
          }
        },
        {
          id: '3',
          type: 'pattern',
          title: 'Collaboration Opportunity',
          description: 'Team collaboration has increased 35% when working on cross-functional projects.',
          priority: 'medium',
          confidence: 85,
          impact: 'medium',
          actionable: true,
          recommendations: [
            'Initiate more cross-team collaborations',
            'Schedule regular knowledge sharing sessions',
            'Create shared project spaces'
          ]
        },
        {
          id: '4',
          type: 'optimization',
          title: 'Task Complexity Mismatch',
          description: 'High-complexity tasks scheduled during low-energy periods result in 60% longer completion times.',
          priority: 'medium',
          confidence: 89,
          impact: 'high',
          actionable: true,
          recommendations: [
            'Reschedule complex tasks to morning hours',
            'Break large tasks into smaller components',
            'Use afternoon for administrative work'
          ]
        },
        {
          id: '5',
          type: 'recommendation',
          title: 'Goal Achievement Probability',
          description: 'Current pace suggests 87% probability of achieving Q4 goals with strategic adjustments.',
          priority: 'low',
          confidence: 76,
          impact: 'medium',
          actionable: true,
          recommendations: [
            'Increase focus time by 1 hour daily',
            'Delegate 2-3 lower priority tasks',
            'Set weekly milestone checkpoints'
          ]
        }
      ];
      
      setInsights(mockInsights);
      setIsAnalyzing(false);
    };

    generateInsights();
  }, [data, timeRange]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'productivity': return ArrowTrendingUpIcon;
      case 'burnout': return ExclamationTriangleIcon;
      case 'optimization': return CpuChipIcon;
      case 'pattern': return LightBulbIcon;
      case 'recommendation': return ShieldCheckIcon;
      default: return LightBulbIcon;
    }
  };

  const getInsightColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  const getPriorityBadgeVariant = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  // Performance radar data
  const performanceData = [
    { metric: 'Productivity', score: 85, fullMark: 100 },
    { metric: 'Focus', score: 78, fullMark: 100 },
    { metric: 'Collaboration', score: 92, fullMark: 100 },
    { metric: 'Work-Life Balance', score: 65, fullMark: 100 },
    { metric: 'Goal Progress', score: 73, fullMark: 100 },
    { metric: 'Efficiency', score: 88, fullMark: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <CpuChipIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Machine learning analysis of your productivity patterns
                </p>
              </div>
            </div>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Analyzing patterns...
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Key Insights</h3>
          
          {insights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, ...springPresets.gentle }}
              >
                <Card 
                  className={cn(
                    "glass-card hover:glass-elevated transition-all duration-300 cursor-pointer",
                    selectedInsight?.id === insight.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5", getInsightColor(insight.priority))}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityBadgeVariant(insight.priority)} className="text-xs">
                              {insight.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                        
                        {insight.actionable && (
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <ShieldCheckIcon className="w-3 h-3" />
                            Actionable recommendations available
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Performance Overview */}
        <div className="space-y-6">
          {/* Performance Radar */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={performanceData}>
                  <PolarGrid stroke="oklch(0.9 0.01 240)" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fontSize: 12, fill: 'oklch(0.45 0.02 270)' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: 'oklch(0.45 0.02 270)' }}
                  />
                  <Radar 
                    name="Performance" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Selected Insight Details */}
          {selectedInsight && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springPresets.gentle}
            >
              <Card className="glass-elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Insight Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{selectedInsight.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedInsight.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Confidence</span>
                      <span className="font-medium">{selectedInsight.confidence}%</span>
                    </div>
                    <Progress value={selectedInsight.confidence} className="h-2" />
                  </div>

                  {selectedInsight.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 text-sm">Recommendations:</h5>
                      <ul className="space-y-2">
                        {selectedInsight.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Apply Recommendations
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">AI Analysis Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Points Analyzed</span>
                <span className="font-semibold">2,847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Patterns Identified</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Actionable Insights</span>
                <span className="font-semibold">{insights.filter(i => i.actionable).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Confidence</span>
                <span className="font-semibold">
                  {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}