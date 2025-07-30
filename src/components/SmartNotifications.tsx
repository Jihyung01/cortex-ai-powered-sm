import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendUp,
  Brain,
  Calendar,
  Lightbulb
} from '@phosphor-icons/react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { useTasks } from '@/hooks/use-tasks';
import { useNotes } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartNotification {
  id: string;
  type: 'reminder' | 'suggestion' | 'achievement' | 'insight' | 'deadline';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  actionLabel?: string;
  actionCallback?: () => void;
  dismissible: boolean;
  relatedTaskId?: string;
  relatedNoteId?: string;
}

export function SmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    insights, 
    unreadInsights, 
    assistantState, 
    generateDailyReport,
    generateProductivityInsights 
  } = useAIAssistant();
  const { getOverdueTasks, getUpcomingTasks, tasks } = useTasks();
  const { notes } = useNotes();

  // Generate smart notifications based on user patterns and AI insights
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: SmartNotification[] = [];
      const now = new Date();

      // Overdue task reminders
      const overdueTasks = getOverdueTasks();
      if (overdueTasks.length > 0) {
        newNotifications.push({
          id: `overdue-${Date.now()}`,
          type: 'reminder',
          title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
          description: `You have tasks that are past their deadline. Would you like me to help reschedule them?`,
          priority: 'high',
          timestamp: now,
          actionLabel: 'Review Tasks',
          actionCallback: () => {
            // Navigate to tasks view with overdue filter
          },
          dismissible: true
        });
      }

      // Upcoming deadline reminders
      const upcomingTasks = getUpcomingTasks(1); // Tasks due in next 24 hours
      if (upcomingTasks.length > 0) {
        newNotifications.push({
          id: `upcoming-${Date.now()}`,
          type: 'reminder',
          title: 'Tasks Due Soon',
          description: `${upcomingTasks.length} task${upcomingTasks.length > 1 ? 's' : ''} due within 24 hours`,
          priority: 'medium',
          timestamp: now,
          actionLabel: 'View Calendar',
          dismissible: true
        });
      }

      // Daily report suggestions (if enabled and it's morning)
      const hour = now.getHours();
      if (assistantState.dailyReportsEnabled && hour >= 8 && hour <= 10) {
        const lastReport = localStorage.getItem('last-daily-report');
        const today = now.toDateString();
        
        if (lastReport !== today) {
          newNotifications.push({
            id: `daily-report-${Date.now()}`,
            type: 'suggestion',
            title: 'Ready for Your Daily Report?',
            description: 'Get personalized insights about your productivity and task progress',
            priority: 'low',
            timestamp: now,
            actionLabel: 'Generate Report',
            actionCallback: () => {
              generateDailyReport();
              localStorage.setItem('last-daily-report', today);
            },
            dismissible: true
          });
        }
      }

      // Weekly insights (if enabled and it's Sunday/Monday)
      const dayOfWeek = now.getDay();
      if (assistantState.weeklyReportsEnabled && (dayOfWeek === 0 || dayOfWeek === 1)) {
        const lastWeeklyInsight = localStorage.getItem('last-weekly-insight');
        const weekKey = `${now.getFullYear()}-${Math.floor(now.getDate() / 7)}`;
        
        if (lastWeeklyInsight !== weekKey) {
          newNotifications.push({
            id: `weekly-insight-${Date.now()}`,
            type: 'insight',
            title: 'Weekly Productivity Review',
            description: 'Discover patterns in your work habits and get personalized recommendations',
            priority: 'medium',
            timestamp: now,
            actionLabel: 'View Insights',
            actionCallback: () => {
              generateProductivityInsights();
              localStorage.setItem('last-weekly-insight', weekKey);
            },
            dismissible: true
          });
        }
      }

      // Achievement notifications (task completion streaks, goals met, etc.)
      const completedToday = tasks.filter(task => {
        const completedDate = task.completedAt ? new Date(task.completedAt) : null;
        return completedDate && completedDate.toDateString() === today;
      });

      if (completedToday.length >= 5) {
        newNotifications.push({
          id: `achievement-${Date.now()}`,
          type: 'achievement',
          title: '🎉 Productive Day!',
          description: `You've completed ${completedToday.length} tasks today. Keep up the momentum!`,
          priority: 'low',
          timestamp: now,
          actionLabel: 'View Analytics',
          dismissible: true
        });
      }

      // Focus time optimization suggestions
      if (assistantState.focusTimeOptimization && hour >= 14 && hour <= 16) {
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
        if (inProgressTasks.length > 3) {
          newNotifications.push({
            id: `focus-suggestion-${Date.now()}`,
            type: 'suggestion',
            title: 'Too Many Active Tasks?',
            description: 'Consider focusing on 1-2 tasks for better productivity. I can help you prioritize.',
            priority: 'medium',
            timestamp: now,
            actionLabel: 'Get Help',
            dismissible: true
          });
        }
      }

      setNotifications(prev => {
        // Remove old notifications (older than 1 hour)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const filtered = prev.filter(n => new Date(n.timestamp) > oneHourAgo);
        
        // Add new notifications, avoiding duplicates
        const existingTypes = filtered.map(n => n.type);
        const uniqueNew = newNotifications.filter(n => !existingTypes.includes(n.type));
        
        return [...filtered, ...uniqueNew];
      });
    };

    // Generate notifications on mount and every 30 minutes
    generateNotifications();
    const interval = setInterval(generateNotifications, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [
    tasks, 
    notes, 
    assistantState, 
    getOverdueTasks, 
    getUpcomingTasks, 
    generateDailyReport, 
    generateProductivityInsights
  ]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (notification: SmartNotification) => {
    if (notification.actionCallback) {
      notification.actionCallback();
    }
    dismissNotification(notification.id);
  };

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4" />;
      case 'achievement':
        return <CheckCircle className="h-4 w-4" />;
      case 'insight':
        return <TrendUp className="h-4 w-4" />;
      case 'deadline':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (priority: SmartNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'accent';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <AnimatePresence>
        {!isExpanded && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className="glass-card shadow-lg"
              variant="secondary"
            >
              <Bell className="h-4 w-4 mr-2" />
              {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {notifications.filter(n => n.priority === 'high').length || notifications.length}
              </Badge>
            </Button>
          </motion.div>
        )}

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Smart Notifications</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="glass-card shadow-lg border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          "p-1 rounded",
                          notification.priority === 'high' && "bg-destructive/10 text-destructive",
                          notification.priority === 'medium' && "bg-accent/10 text-accent",
                          notification.priority === 'low' && "bg-secondary/10 text-secondary"
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <CardTitle className="text-sm">{notification.title}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                      
                      {notification.dismissible && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  {notification.actionLabel && (
                    <CardContent className="pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(notification)}
                        className="text-xs"
                      >
                        {notification.actionLabel}
                      </Button>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}