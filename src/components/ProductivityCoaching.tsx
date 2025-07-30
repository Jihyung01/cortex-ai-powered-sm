import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  TrendUp, 
  Calendar, 
  Clock, 
  Target,
  Brain,
  Heart,
  BarChart,
  Flame,
  CheckCircle,
  Warning,
  Lightbulb
} from '@phosphor-icons/react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { useTasks } from '@/hooks/use-tasks';
import { useNotes } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProductivityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  improvement: number; // percentage change
}

interface WorkLifeRecommendation {
  id: string;
  type: 'break' | 'focus' | 'balance' | 'health';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedImpact: number; // 1-10 scale
}

interface HabitTracker {
  id: string;
  name: string;
  description: string;
  targetFrequency: number; // per week
  currentStreak: number;
  longestStreak: number;
  completedThisWeek: number;
  isActive: boolean;
}

export function ProductivityCoaching() {
  const { 
    goals, 
    insights, 
    assistantState, 
    generateProductivityInsights,
    addGoal
  } = useAIAssistant();
  const { tasks, getTaskAnalytics } = useTasks();
  const { notes } = useNotes();

  const [habits, setHabits] = useState<HabitTracker[]>([
    {
      id: '1',
      name: 'Daily Planning',
      description: 'Review tasks and priorities each morning',
      targetFrequency: 7,
      currentStreak: 3,
      longestStreak: 12,
      completedThisWeek: 5,
      isActive: true
    },
    {
      id: '2',
      name: 'Focus Blocks',
      description: 'Work in 90-minute focused sessions',
      targetFrequency: 5,
      currentStreak: 2,
      longestStreak: 8,
      completedThisWeek: 3,
      isActive: true
    },
    {
      id: '3',
      name: 'Weekly Review',
      description: 'Reflect on accomplishments and plan ahead',
      targetFrequency: 1,
      currentStreak: 1,
      longestStreak: 6,
      completedThisWeek: 1,
      isActive: true
    }
  ]);

  const analytics = getTaskAnalytics();

  // Generate productivity metrics
  const productivityMetrics: ProductivityMetric[] = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const tasksThisWeek = tasks.filter(task => 
      new Date(task.createdAt) >= lastWeek
    ).length;
    
    const completedThisWeek = tasks.filter(task => 
      task.completedAt && new Date(task.completedAt) >= lastWeek
    ).length;

    const notesThisWeek = notes.filter(note =>
      new Date(note.createdAt) >= lastWeek
    ).length;

    return [
      {
        id: 'completion-rate',
        name: 'Completion Rate',
        value: analytics.completionRate,
        target: 85,
        unit: '%',
        trend: analytics.completionRate > 80 ? 'up' : analytics.completionRate > 60 ? 'stable' : 'down',
        improvement: 5.2
      },
      {
        id: 'productivity-score',
        name: 'Productivity Score',
        value: analytics.productivityScore,
        target: 90,
        unit: '/100',
        trend: analytics.productivityScore > 75 ? 'up' : 'stable',
        improvement: 12.1
      },
      {
        id: 'tasks-completed',
        name: 'Tasks This Week',
        value: completedThisWeek,
        target: 15,
        unit: 'tasks',
        trend: completedThisWeek > 10 ? 'up' : 'stable',
        improvement: 8.3
      },
      {
        id: 'notes-created',
        name: 'Notes This Week',
        value: notesThisWeek,
        target: 10,
        unit: 'notes',
        trend: notesThisWeek > 8 ? 'up' : 'stable',
        improvement: -2.1
      }
    ];
  }, [analytics, tasks, notes]);

  // Generate work-life balance recommendations
  const workLifeRecommendations: WorkLifeRecommendation[] = useMemo(() => {
    const recommendations: WorkLifeRecommendation[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Check working hours
    if (hour > 18) {
      recommendations.push({
        id: 'evening-break',
        type: 'balance',
        title: 'Consider Wrapping Up',
        description: 'You\'ve been working late. Consider setting boundaries for better work-life balance.',
        urgency: 'medium',
        estimatedImpact: 7
      });
    }

    // Check task overload
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
    if (inProgressTasks.length > 5) {
      recommendations.push({
        id: 'task-overload',
        type: 'focus',
        title: 'Reduce Active Tasks',
        description: `You have ${inProgressTasks.length} tasks in progress. Focus on 2-3 for better results.`,
        urgency: 'high',
        estimatedImpact: 8
      });
    }

    // Check break time
    if (hour >= 14 && hour <= 16) {
      recommendations.push({
        id: 'afternoon-break',
        type: 'break',
        title: 'Take an Afternoon Break',
        description: 'A 15-minute break can help restore focus and energy for the rest of the day.',
        urgency: 'low',
        estimatedImpact: 6
      });
    }

    // Check completion rate
    if (analytics.completionRate < 60) {
      recommendations.push({
        id: 'completion-improvement',
        type: 'focus',
        title: 'Improve Task Completion',
        description: 'Your completion rate is below optimal. Try breaking large tasks into smaller ones.',
        urgency: 'high',
        estimatedImpact: 9
      });
    }

    return recommendations;
  }, [tasks, analytics]);

  const generatePersonalizedTips = async () => {
    try {
      const prompt = spark.llmPrompt`Based on the user's productivity data, generate 3-5 personalized productivity tips:

Current metrics:
- Completion rate: ${analytics.completionRate.toFixed(1)}%
- Productivity score: ${analytics.productivityScore.toFixed(1)}/100
- Active tasks: ${tasks.filter(t => t.status === 'in-progress').length}
- Total tasks: ${tasks.length}
- Total notes: ${notes.length}

Recent patterns:
- Overdue tasks: ${tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length}
- Completed this week: ${tasks.filter(t => t.completedAt && new Date(t.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}

Provide actionable, personalized tips to improve productivity. Return as JSON array with title and description fields.`;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const tips = JSON.parse(response);
      
      return tips;
    } catch (error) {
      console.error('Failed to generate personalized tips:', error);
      return [];
    }
  };

  const completeHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { 
            ...habit, 
            currentStreak: habit.currentStreak + 1,
            longestStreak: Math.max(habit.longestStreak, habit.currentStreak + 1),
            completedThisWeek: habit.completedThisWeek + 1
          }
        : habit
    ));
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendUp className="h-4 w-4 text-red-500 rotate-180" />;
      case 'stable':
        return <BarChart className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'accent';
      case 'low':
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {productivityMetrics.map((metric) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                    <p className="text-2xl font-bold">
                      {metric.value.toFixed(metric.unit === '%' ? 0 : 1)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {metric.unit}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    {getTrendIcon(metric.trend)}
                    <p className={cn(
                      "text-xs",
                      metric.improvement > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {metric.improvement > 0 ? '+' : ''}{metric.improvement.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{metric.target}{metric.unit} target</span>
                  </div>
                  <Progress 
                    value={Math.min((metric.value / metric.target) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="habits">Habit Tracker</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Work-Life Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workLifeRecommendations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Great work-life balance! Keep it up! 🎉
                  </p>
                ) : (
                  workLifeRecommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        rec.type === 'break' && "bg-blue-50 text-blue-600",
                        rec.type === 'focus' && "bg-purple-50 text-purple-600",
                        rec.type === 'balance' && "bg-green-50 text-green-600",
                        rec.type === 'health' && "bg-red-50 text-red-600"
                      )}>
                        {rec.type === 'break' && <Clock className="h-4 w-4" />}
                        {rec.type === 'focus' && <Target className="h-4 w-4" />}
                        {rec.type === 'balance' && <Heart className="h-4 w-4" />}
                        {rec.type === 'health' && <Warning className="h-4 w-4" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge variant={getUrgencyColor(rec.urgency)} className="text-xs">
                            {rec.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Impact:</span>
                          <div className="flex">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-2 h-2 rounded-full mr-1",
                                  i < rec.estimatedImpact ? "bg-primary" : "bg-muted"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                Habit Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {habits.map((habit) => {
                const progressPercentage = (habit.completedThisWeek / habit.targetFrequency) * 100;
                
                return (
                  <div key={habit.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{habit.name}</h4>
                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeHabit(habit.id)}
                        disabled={progressPercentage >= 100}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Streak</span>
                        <p className="font-medium">{habit.currentStreak} days</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Longest Streak</span>
                        <p className="font-medium">{habit.longestStreak} days</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">This Week</span>
                        <p className="font-medium">{habit.completedThisWeek}/{habit.targetFrequency}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Weekly Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Powered Insights
                </CardTitle>
                <Button size="sm" onClick={generatePersonalizedTips}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Tips
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No insights yet. Continue using Cortex to receive personalized productivity insights.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          insight.type === 'pattern' && "bg-blue-50 text-blue-600",
                          insight.type === 'recommendation' && "bg-green-50 text-green-600",
                          insight.type === 'warning' && "bg-red-50 text-red-600",
                          insight.type === 'achievement' && "bg-yellow-50 text-yellow-600"
                        )}>
                          <TrendUp className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}