import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChartLine, 
  Target, 
  Clock, 
  CheckSquare, 
  TrendUp, 
  TrendDown,
  Calendar,
  Timer,
  Brain,
  Star,
  Zap
} from '@phosphor-icons/react';
import { useTasks } from '@/hooks/use-tasks';
import { cn } from '@/lib/utils';

export function AnalyticsView() {
  const { tasks, getTaskAnalytics } = useTasks();
  const analytics = getTaskAnalytics();

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentTasks = tasks.filter(task => new Date(task.createdAt) >= thirtyDaysAgo);
    const weeklyTasks = tasks.filter(task => new Date(task.createdAt) >= sevenDaysAgo);
    
    const overdueTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'done' && 
      task.status !== 'cancelled'
    );

    const highPriorityTasks = tasks.filter(task => 
      task.priority === 'high' && 
      task.status !== 'done' && 
      task.status !== 'cancelled'
    );

    const avgPomodoroSessions = tasks.length > 0 
      ? tasks.reduce((sum, task) => sum + task.pomodoroSessions, 0) / tasks.length 
      : 0;

    const totalPomodoroSessions = tasks.reduce((sum, task) => sum + task.pomodoroSessions, 0);

    // Calculate trend for completion rate
    const lastWeekCompleted = tasks.filter(task => 
      task.status === 'done' && 
      task.completedAt &&
      new Date(task.completedAt) >= sevenDaysAgo
    ).length;

    const previousWeekStart = new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekCompleted = tasks.filter(task => 
      task.status === 'done' && 
      task.completedAt &&
      new Date(task.completedAt) >= previousWeekStart &&
      new Date(task.completedAt) < sevenDaysAgo
    ).length;

    const completionTrend = previousWeekCompleted > 0 
      ? ((lastWeekCompleted - previousWeekCompleted) / previousWeekCompleted) * 100
      : 0;

    return {
      recentTasks: recentTasks.length,
      weeklyTasks: weeklyTasks.length,
      overdueTasks: overdueTasks.length,
      highPriorityTasks: highPriorityTasks.length,
      avgPomodoroSessions: Math.round(avgPomodoroSessions * 10) / 10,
      totalPomodoroSessions,
      completionTrend: Math.round(completionTrend),
      lastWeekCompleted,
      previousWeekCompleted
    };
  }, [tasks]);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend, 
    color = "default" 
  }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    trend?: number;
    color?: "default" | "success" | "warning" | "danger";
  }) => {
    const colorClasses = {
      default: "text-primary",
      success: "text-green-600",
      warning: "text-yellow-600",
      danger: "text-red-600"
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className={cn("p-3 rounded-lg bg-muted/50", colorClasses[color])}>
              <Icon size={24} />
            </div>
          </div>
          {trend !== undefined && (
            <div className="flex items-center mt-3">
              {trend >= 0 ? (
                <TrendUp className="text-green-600 mr-1" size={16} />
              ) : (
                <TrendDown className="text-red-600 mr-1" size={16} />
              )}
              <span className={cn(
                "text-sm font-medium",
                trend >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {Math.abs(trend)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last week</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track your productivity and task completion patterns
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Brain size={16} />
            AI Insights
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <ScrollArea className="h-full">
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Tasks"
                value={analytics.totalTasks}
                icon={CheckSquare}
                description="Last 30 days"
                color="default"
              />
              <StatCard
                title="Completion Rate"
                value={`${Math.round(analytics.completionRate)}%`}
                icon={Target}
                description={`${analytics.completedTasks} completed`}
                trend={metrics.completionTrend}
                color="success"
              />
              <StatCard
                title="Productivity Score"
                value={Math.round(analytics.productivityScore)}
                icon={Zap}
                description="AI-calculated score"
                color={analytics.productivityScore >= 70 ? "success" : 
                       analytics.productivityScore >= 40 ? "warning" : "danger"}
              />
              <StatCard
                title="Avg. Completion Time"
                value={`${Math.round(analytics.averageCompletionTime / 60)}h`}
                icon={Clock}
                description="Per task average"
                color="default"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Overdue Tasks"
                value={metrics.overdueTasks}
                icon={Calendar}
                color={metrics.overdueTasks > 0 ? "danger" : "success"}
              />
              <StatCard
                title="High Priority"
                value={metrics.highPriorityTasks}
                icon={Star}
                description="Pending tasks"
                color={metrics.highPriorityTasks > 5 ? "warning" : "default"}
              />
              <StatCard
                title="This Week"
                value={metrics.lastWeekCompleted}
                icon={CheckSquare}
                description="Tasks completed"
                trend={metrics.completionTrend}
                color="success"
              />
              <StatCard
                title="Pomodoro Sessions"
                value={metrics.totalPomodoroSessions}
                icon={Timer}
                description={`${metrics.avgPomodoroSessions} avg per task`}
                color="default"
              />
            </div>

            <Tabs defaultValue="progress" className="space-y-4">
              <TabsList>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="complexity">Complexity</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-4">
                {/* Weekly Progress Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartLine size={20} />
                      Weekly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.weeklyProgress.map((week, index) => (
                        <div key={week.week} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Week of {new Date(week.week).toLocaleDateString()}
                            </span>
                            <span className="font-medium">
                              {week.completed}/{week.created} completed
                            </span>
                          </div>
                          <Progress 
                            value={week.created > 0 ? (week.completed / week.created) * 100 : 0}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Task Status Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Task Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { status: 'todo', label: 'To Do', color: 'bg-gray-500' },
                        { status: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
                        { status: 'done', label: 'Completed', color: 'bg-green-500' },
                        { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
                      ].map(({ status, label, color }) => {
                        const count = tasks.filter(task => task.status === status).length;
                        const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                        
                        return (
                          <div key={status} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded", color)} />
                                <span>{label}</span>
                              </div>
                              <span className="font-medium">{count} tasks</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="complexity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Complexity Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { 
                          complexity: 'simple', 
                          label: 'Simple', 
                          count: analytics.complexityDistribution.simple,
                          color: 'bg-green-500'
                        },
                        { 
                          complexity: 'moderate', 
                          label: 'Moderate', 
                          count: analytics.complexityDistribution.moderate,
                          color: 'bg-yellow-500'
                        },
                        { 
                          complexity: 'complex', 
                          label: 'Complex', 
                          count: analytics.complexityDistribution.complex,
                          color: 'bg-red-500'
                        }
                      ].map(({ complexity, label, count, color }) => {
                        const total = Object.values(analytics.complexityDistribution).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        
                        return (
                          <div key={complexity} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded", color)} />
                                <span>{label}</span>
                              </div>
                              <span className="font-medium">{count} tasks</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain size={20} />
                      AI-Powered Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Productivity Insights */}
                    <div className="space-y-3">
                      {analytics.productivityScore < 50 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Low Productivity Alert</h4>
                          <p className="text-sm text-yellow-700">
                            Your productivity score is below average. Consider breaking down complex tasks 
                            or adjusting your workload.
                          </p>
                        </div>
                      )}

                      {metrics.overdueTasks > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2">🚨 Overdue Tasks</h4>
                          <p className="text-sm text-red-700">
                            You have {metrics.overdueTasks} overdue task{metrics.overdueTasks > 1 ? 's' : ''}. 
                            Consider prioritizing these or adjusting deadlines.
                          </p>
                        </div>
                      )}

                      {analytics.completionRate > 80 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">🎉 Great Performance</h4>
                          <p className="text-sm text-green-700">
                            Excellent completion rate! You're consistently finishing your tasks.
                          </p>
                        </div>
                      )}

                      {metrics.avgPomodoroSessions > 3 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">🍅 Pomodoro Champion</h4>
                          <p className="text-sm text-blue-700">
                            You're using the Pomodoro technique effectively! Keep up the focused work sessions.
                          </p>
                        </div>
                      )}

                      {analytics.complexityDistribution.complex > analytics.complexityDistribution.simple && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">🧠 Complexity Balance</h4>
                          <p className="text-sm text-purple-700">
                            You have more complex tasks than simple ones. Consider breaking them down 
                            into smaller, manageable pieces.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}