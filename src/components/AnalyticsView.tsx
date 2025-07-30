import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  Settings,
  Target,
  Clock,
  Brain,
  Users,
  FileText,
  CheckSquare,
  Timer,
  Zap,
  Award,
  Eye
} from '@phosphor-icons/react';
import { useNotes } from '@/hooks/use-notes';
import { useTasks } from '@/hooks/use-tasks';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export default function AnalyticsView() {
  const { notes } = useNotes();
  const { tasks } = useTasks();
  const isMobile = useIsMobile();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Filter data by time range
    const recentNotes = notes.filter(note => new Date(note.createdAt) >= startDate);
    const recentTasks = tasks.filter(task => new Date(task.createdAt) >= startDate);
    
    // Calculate completion rate
    const completedTasks = recentTasks.filter(task => task.status === 'done');
    const completionRate = recentTasks.length > 0 ? (completedTasks.length / recentTasks.length) * 100 : 0;
    
    // Calculate productivity score (simplified)
    const productivityScore = Math.min(100, Math.round(
      (recentNotes.length * 2 + completedTasks.length * 3 + recentTasks.length) / 2
    ));
    
    // Mood distribution
    const moodCounts = notes.reduce((acc, note) => {
      if (note.mood) {
        acc[note.mood] = (acc[note.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Priority distribution
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Tag analysis
    const tagCounts = [...notes, ...tasks].reduce((acc, item) => {
      item.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      totalNotes: notes.length,
      totalTasks: tasks.length,
      recentNotes: recentNotes.length,
      recentTasks: recentTasks.length,
      completedTasks: completedTasks.length,
      completionRate,
      productivityScore,
      moodCounts,
      priorityCounts,
      topTags,
      overdueTasks: tasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < now && 
        task.status !== 'done'
      ).length
    };
  }, [notes, tasks, timeRange]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Analytics
              </h1>
              <p className="text-muted-foreground">
                Insights into your productivity and performance
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="font-semibold">{analyticsData.totalNotes}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                  <p className="font-semibold">{analyticsData.totalTasks}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Completion</p>
                  <p className="font-semibold">{Math.round(analyticsData.completionRate)}%</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Productivity</p>
                  <p className={cn("font-semibold", getScoreColor(analyticsData.productivityScore))}>
                    {analyticsData.productivityScore}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className="font-semibold">{analyticsData.overdueTasks}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Recent</p>
                  <p className="font-semibold">{analyticsData.recentNotes + analyticsData.recentTasks}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="productivity">Productivity</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="overview" className="p-4 space-y-6">
              {/* Productivity Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Productivity Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Current Score</span>
                        <Badge className={getScoreBadgeColor(analyticsData.productivityScore)}>
                          {analyticsData.productivityScore}/100
                        </Badge>
                      </div>
                      <Progress value={analyticsData.productivityScore} className="h-3" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{analyticsData.productivityScore}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" />
                    Task Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Completed Tasks</span>
                        <span className="text-sm text-muted-foreground">
                          {analyticsData.completedTasks} / {analyticsData.recentTasks}
                        </span>
                      </div>
                      <Progress value={analyticsData.completionRate} className="h-3" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{Math.round(analyticsData.completionRate)}%</p>
                      <p className="text-xs text-muted-foreground">Complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Notes Created</span>
                        <Badge variant="outline">{analyticsData.recentNotes}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tasks Created</span>
                        <Badge variant="outline">{analyticsData.recentTasks}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tasks Completed</span>
                        <Badge variant="outline">{analyticsData.completedTasks}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overdue Tasks</span>
                        <Badge variant={analyticsData.overdueTasks > 0 ? "destructive" : "outline"}>
                          {analyticsData.overdueTasks}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.topTags.slice(0, 6).map(([tag, count], index) => (
                        <div key={tag} className="flex items-center justify-between">
                          <span className="text-sm font-medium">#{tag}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                      {analyticsData.topTags.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No tags found. Start adding tags to your notes and tasks!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="productivity" className="p-4 space-y-6">
              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.priorityCounts).map(([priority, count]) => {
                      const total = Object.values(analyticsData.priorityCounts).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={priority} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{priority}</span>
                            <span className="text-sm text-muted-foreground">{count} tasks</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Mood Analysis */}
              {Object.keys(analyticsData.moodCounts).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analyticsData.moodCounts).map(([mood, count]) => {
                        const total = Object.values(analyticsData.moodCounts).reduce((a, b) => a + b, 0);
                        const percentage = (count / total) * 100;
                        const moodEmoji = mood === 'positive' ? '😊' : mood === 'negative' ? '😔' : '😐';
                        
                        return (
                          <div key={mood} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-2">
                                {moodEmoji} {mood}
                              </span>
                              <span className="text-sm text-muted-foreground">{count} notes</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="patterns" className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Pattern analysis will be available as you use Cortex more.
                      <br />
                      Keep creating notes and tasks to see your patterns emerge!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.overdueTasks > 0 && (
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-medium text-red-700">Overdue Tasks Detected</h4>
                        <p className="text-sm text-red-600">
                          You have {analyticsData.overdueTasks} overdue task{analyticsData.overdueTasks !== 1 ? 's' : ''}. 
                          Consider reviewing your priorities and deadlines.
                        </p>
                      </div>
                    )}
                    
                    {analyticsData.completionRate < 50 && analyticsData.recentTasks > 0 && (
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h4 className="font-medium text-yellow-700">Low Completion Rate</h4>
                        <p className="text-sm text-yellow-600">
                          Your task completion rate is {Math.round(analyticsData.completionRate)}%. 
                          Consider breaking down larger tasks into smaller, manageable ones.
                        </p>
                      </div>
                    )}
                    
                    {analyticsData.productivityScore >= 80 && (
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-green-700">Great Productivity!</h4>
                        <p className="text-sm text-green-600">
                          You're maintaining excellent productivity with a score of {analyticsData.productivityScore}. 
                          Keep up the great work!
                        </p>
                      </div>
                    )}
                    
                    {analyticsData.recentNotes === 0 && analyticsData.recentTasks === 0 && (
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-blue-700">Time to Get Started</h4>
                        <p className="text-sm text-blue-600">
                          You haven't created any notes or tasks recently. 
                          Start by capturing your thoughts and organizing your work!
                        </p>
                      </div>
                    )}
                    
                    {analyticsData.topTags.length === 0 && (
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-medium text-purple-700">Add Tags for Better Organization</h4>
                        <p className="text-sm text-purple-600">
                          Start using tags to categorize your notes and tasks. 
                          This will help you find content faster and see patterns in your work.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}