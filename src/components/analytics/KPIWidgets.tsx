import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ClockIcon, 
  CheckCircleIcon,
  UsersIcon,
  TargetIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { springPresets } from '@/hooks/use-motion';

interface KPIWidgetsProps {
  data: any;
  timeRange: string;
}

interface KPIMetric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  sparklineData?: Array<{ value: number }>;
  target?: number;
  unit?: string;
}

export function KPIWidgets({ data, timeRange }: KPIWidgetsProps) {
  const kpiMetrics: KPIMetric[] = useMemo(() => {
    const productivityData = data.productivity || [];
    const recentData = productivityData.slice(-7);
    
    const totalTasks = recentData.reduce((sum, day) => sum + day.tasks, 0);
    const totalNotes = recentData.reduce((sum, day) => sum + day.notes, 0);
    const avgFocus = recentData.reduce((sum, day) => sum + day.focus, 0) / Math.max(recentData.length, 1);
    const totalCollaboration = recentData.reduce((sum, day) => sum + day.collaboration, 0);

    // Calculate trends (mock for now)
    const taskTrend = Math.random() > 0.5 ? 'up' : 'down';
    const focusTrend = Math.random() > 0.5 ? 'up' : 'down';
    const collaborationTrend = Math.random() > 0.5 ? 'up' : 'down';

    return [
      {
        title: 'Tasks Completed',
        value: totalTasks,
        change: 12.5,
        trend: taskTrend,
        icon: CheckCircleIcon,
        color: 'text-green-600',
        sparklineData: recentData.map(d => ({ value: d.tasks })),
        target: 70,
        unit: 'tasks'
      },
      {
        title: 'Focus Hours',
        value: avgFocus.toFixed(1),
        change: -5.2,
        trend: focusTrend,
        icon: ClockIcon,
        color: 'text-blue-600',
        sparklineData: recentData.map(d => ({ value: d.focus })),
        target: 6,
        unit: 'hours'
      },
      {
        title: 'Notes Created',
        value: totalNotes,
        change: 8.7,
        trend: 'up',
        icon: TargetIcon,
        color: 'text-purple-600',
        sparklineData: recentData.map(d => ({ value: d.notes })),
        unit: 'notes'
      },
      {
        title: 'Collaboration',
        value: totalCollaboration,
        change: 15.3,
        trend: collaborationTrend,
        icon: UsersIcon,
        color: 'text-orange-600',
        sparklineData: recentData.map(d => ({ value: d.collaboration })),
        unit: 'sessions'
      },
      {
        title: 'Productivity Score',
        value: '87%',
        change: 3.2,
        trend: 'up',
        icon: ArrowTrendingUpIcon,
        color: 'text-emerald-600',
        target: 90,
        unit: '%'
      },
      {
        title: 'Goal Progress',
        value: '68%',
        change: 5.8,
        trend: 'up',
        icon: TargetIcon,
        color: 'text-indigo-600',
        target: 100,
        unit: '%'
      }
    ];
  }, [data, timeRange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiMetrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, ...springPresets.gentle }}
        >
          <Card className="glass-card hover:glass-elevated transition-all duration-500 group cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5", metric.color)}>
                  <metric.icon className="w-4 h-4" />
                </div>
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {metric.trend === 'up' && <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />}
                  {metric.trend === 'down' && <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />}
                  {Math.abs(metric.change)}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  {metric.unit && (
                    <span className="text-xs text-muted-foreground">{metric.unit}</span>
                  )}
                </div>
                
                <h4 className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </h4>
                
                {metric.target && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium">{metric.target}{metric.unit}</span>
                    </div>
                    <Progress 
                      value={typeof metric.value === 'string' 
                        ? parseInt(metric.value) 
                        : (metric.value / metric.target) * 100
                      } 
                      className="h-1.5"
                    />
                  </div>
                )}
                
                {metric.sparklineData && (
                  <div className="h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metric.sparklineData}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="currentColor" 
                          strokeWidth={1.5}
                          dot={false}
                          className={metric.color}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}