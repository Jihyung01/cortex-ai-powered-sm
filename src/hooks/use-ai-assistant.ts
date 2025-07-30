import { useKV } from '@github/spark/hooks';
import { useState, useCallback, useMemo, useEffect } from 'react';
import type { 
  ChatMessage, 
  ProductivityGoal, 
  ProductivityInsight, 
  AIAssistantState,
  Task,
  Note 
} from '../lib/types';
import { useNotes } from './use-notes';
import { useTasks } from './use-tasks';

export function useAIAssistant() {
  const [messages, setMessages] = useKV<ChatMessage[]>('cortex-ai-messages', []);
  const [goals, setGoals] = useKV<ProductivityGoal[]>('cortex-ai-goals', []);
  const [insights, setInsights] = useKV<ProductivityInsight[]>('cortex-ai-insights', []);
  const [assistantState, setAssistantState] = useKV<AIAssistantState>('cortex-ai-state', {
    isEnabled: true,
    voiceInputEnabled: true,
    autoSuggestions: true,
    dailyReportsEnabled: true,
    weeklyReportsEnabled: true,
    focusTimeOptimization: true,
    smartScheduling: true,
    intelligentReminders: true,
    preferredCommunicationStyle: 'professional',
    personalityTone: 'encouraging'
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const { notes, getRecentNotes } = useNotes();
  const { tasks, getTaskAnalytics, getOverdueTasks, getUpcomingTasks } = useTasks();

  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `👋 **Welcome to Cortex AI!**

I'm your intelligent productivity companion, here to help you:

• **Manage tasks** with smart scheduling and priority insights
• **Organize notes** with AI-powered categorization  
• **Track productivity** with personalized analytics
• **Maintain work-life balance** with gentle reminders

Try asking me:
- "How's my productivity this week?"
- "Create a task to review project notes"
- "Help me organize my schedule"
- "Generate my daily report"

I can understand voice commands too - just click the 🎤 button and speak naturally!

How can I assist you today?`,
        timestamp: new Date(),
        type: 'text',
        metadata: { confidence: 1.0 }
      };
      
      setMessages([welcomeMessage]);
    }
  }, [messages.length, setMessages]);

  // Initialize with sample goals and insights for new users
  useEffect(() => {
    if (goals.length === 0 && insights.length === 0 && tasks.length > 0) {
      // Add sample productivity goal
      const sampleGoal: ProductivityGoal = {
        id: crypto.randomUUID(),
        title: 'Complete 15 Tasks This Week',
        description: 'Maintain consistent productivity by completing at least 15 tasks weekly',
        type: 'weekly',
        targetValue: 15,
        currentValue: tasks.filter(task => {
          const completedThisWeek = task.completedAt && 
            new Date(task.completedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return completedThisWeek;
        }).length,
        unit: 'tasks',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setGoals([sampleGoal]);

      // Add sample insight
      const sampleInsight: ProductivityInsight = {
        id: crypto.randomUUID(),
        type: 'recommendation',
        title: 'Welcome to AI-Powered Productivity!',
        description: 'I\'ve analyzed your current tasks and created a weekly goal for you. As you use Cortex, I\'ll provide personalized insights to boost your productivity.',
        severity: 'low',
        actionItems: [
          'Try the daily report feature for productivity summaries',
          'Use voice commands to quickly create tasks and notes',
          'Check the coaching tab for habit tracking and recommendations'
        ],
        confidence: 1.0,
        createdAt: new Date(),
        isRead: false
      };
      
      setInsights([sampleInsight]);
    }
  }, [goals.length, insights.length, tasks.length, setGoals, setInsights]);

  // Message handling
  const sendMessage = useCallback(async (content: string, type: ChatMessage['type'] = 'text') => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      type
    };
    
    setMessages(current => [...current, userMessage]);
    setIsTyping(true);
    
    try {
      // Generate AI response based on context
      const aiResponse = await generateAIResponse(content, {
        notes,
        tasks,
        recentNotes: getRecentNotes(10),
        analytics: getTaskAnalytics(),
        overdueTasks: getOverdueTasks(),
        upcomingTasks: getUpcomingTasks(7),
        assistantState
      });
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        type: aiResponse.type || 'text',
        metadata: aiResponse.metadata
      };
      
      setMessages(current => [...current, assistantMessage]);
      
      // Update last interaction time
      setAssistantState(current => ({
        ...current,
        lastInteraction: new Date()
      }));
      
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(current => [...current, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, setMessages, notes, tasks, getRecentNotes, getTaskAnalytics, getOverdueTasks, getUpcomingTasks, assistantState, setAssistantState]);

  // Voice input handling
  const startVoiceInput = useCallback(async () => {
    if (!assistantState.voiceInputEnabled) return;
    
    try {
      setIsListening(true);
      // In a real implementation, this would use the Web Speech API
      // For now, we'll simulate it
      const mockVoiceInput = "Create a task for reviewing the quarterly reports";
      await sendMessage(mockVoiceInput);
    } catch (error) {
      console.error('Voice input failed:', error);
    } finally {
      setIsListening(false);
    }
  }, [assistantState.voiceInputEnabled, sendMessage]);

  const stopVoiceInput = useCallback(() => {
    setIsListening(false);
  }, []);

  // Goal management
  const addGoal = useCallback((goal: Omit<ProductivityGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: ProductivityGoal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setGoals(current => [...current, newGoal]);
    return newGoal;
  }, [setGoals]);

  const updateGoal = useCallback((id: string, updates: Partial<ProductivityGoal>) => {
    setGoals(current =>
      current.map(goal =>
        goal.id === id
          ? { ...goal, ...updates, updatedAt: new Date() }
          : goal
      )
    );
  }, [setGoals]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(current => current.filter(goal => goal.id !== id));
  }, [setGoals]);

  // Insight management
  const addInsight = useCallback((insight: Omit<ProductivityInsight, 'id' | 'createdAt'>) => {
    const newInsight: ProductivityInsight = {
      ...insight,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setInsights(current => [...current, newInsight]);
    return newInsight;
  }, [setInsights]);

  const markInsightAsRead = useCallback((id: string) => {
    setInsights(current =>
      current.map(insight =>
        insight.id === id
          ? { ...insight, isRead: true }
          : insight
      )
    );
  }, [setInsights]);

  const dismissInsight = useCallback((id: string) => {
    setInsights(current => current.filter(insight => insight.id !== id));
  }, [setInsights]);

  // Smart suggestions
  const generateTaskSuggestions = useCallback(async (context?: string) => {
    try {
      const recentNotes = getRecentNotes(5);
      const overdueTasks = getOverdueTasks();
      const analytics = getTaskAnalytics();
      
      const prompt = spark.llmPrompt`Based on the user's recent activity, suggest 3-5 actionable tasks.

Recent notes: ${recentNotes.map(n => `- ${n.title}: ${n.content.slice(0, 100)}...`).join('\n')}
Overdue tasks: ${overdueTasks.length}
Completion rate: ${analytics.completionRate.toFixed(1)}%
Context: ${context || 'General productivity'}

Return a JSON array of task suggestions with title, description, priority, and estimated time.`;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate task suggestions:', error);
      return [];
    }
  }, [getRecentNotes, getOverdueTasks, getTaskAnalytics]);

  const generateProductivityInsights = useCallback(async () => {
    try {
      const analytics = getTaskAnalytics();
      const overdueTasks = getOverdueTasks();
      const upcomingTasks = getUpcomingTasks(7);
      
      const prompt = spark.llmPrompt`Analyze the user's productivity patterns and provide insights:

Task Analytics:
- Total tasks: ${analytics.totalTasks}
- Completion rate: ${analytics.completionRate.toFixed(1)}%
- Average completion time: ${analytics.averageCompletionTime.toFixed(1)} minutes
- Productivity score: ${analytics.productivityScore.toFixed(1)}

Current Issues:
- Overdue tasks: ${overdueTasks.length}
- Upcoming tasks (7 days): ${upcomingTasks.length}

Provide insights as JSON array with type, title, description, severity, and actionItems.`;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const insightsData = JSON.parse(response);
      
      // Add insights to the system
      insightsData.forEach((insightData: any) => {
        addInsight({
          type: insightData.type || 'recommendation',
          title: insightData.title,
          description: insightData.description,
          severity: insightData.severity || 'medium',
          actionItems: insightData.actionItems || [],
          confidence: 0.8,
          isRead: false
        });
      });
      
      return insightsData;
    } catch (error) {
      console.error('Failed to generate productivity insights:', error);
      return [];
    }
  }, [getTaskAnalytics, getOverdueTasks, getUpcomingTasks, addInsight]);

  // Daily/weekly reports
  const generateDailyReport = useCallback(async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === today.toDateString();
      });
      
      const completedToday = tasks.filter(task => {
        const completedDate = task.completedAt ? new Date(task.completedAt) : null;
        return completedDate && completedDate.toDateString() === today.toDateString();
      });
      
      const report = {
        date: today.toISOString().split('T')[0],
        tasksCreated: todayTasks.length,
        tasksCompleted: completedToday.length,
        productivityScore: getTaskAnalytics().productivityScore,
        topAchievements: completedToday.slice(0, 3).map(task => task.title),
        recommendations: await generateTaskSuggestions('Daily planning')
      };
      
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `📊 **Daily Report for ${today.toLocaleDateString()}**

✅ **Tasks Completed:** ${report.tasksCompleted}
📝 **Tasks Created:** ${report.tasksCreated}
⭐ **Productivity Score:** ${report.productivityScore.toFixed(1)}/100

${report.topAchievements.length > 0 ? `🏆 **Top Achievements:**
${report.topAchievements.map(title => `• ${title}`).join('\n')}` : ''}

Keep up the great work! 🚀`,
        timestamp: new Date(),
        type: 'productivity_insight',
        metadata: {
          confidence: 0.9
        }
      };
      
      setMessages(current => [...current, message]);
      return report;
    } catch (error) {
      console.error('Failed to generate daily report:', error);
      return null;
    }
  }, [tasks, getTaskAnalytics, generateTaskSuggestions, setMessages]);

  // Smart scheduling
  const suggestOptimalTaskScheduling = useCallback(async (taskIds: string[]) => {
    try {
      const selectedTasks = tasks.filter(task => taskIds.includes(task.id));
      const upcomingTasks = getUpcomingTasks(14);
      
      const prompt = spark.llmPrompt`Suggest optimal scheduling for these tasks considering priority, estimated time, and deadlines:

Tasks to schedule:
${selectedTasks.map(task => `- ${task.title} (Priority: ${task.priority}, Est: ${task.estimatedTime || 30}min, Due: ${task.dueDate || 'No deadline'})`).join('\n')}

Current workload:
${upcomingTasks.map(task => `- ${task.title} (Due: ${task.dueDate})`).join('\n')}

Provide scheduling suggestions with optimal time blocks and reasoning.`;

      const response = await spark.llm(prompt, 'gpt-4o-mini');
      
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'task_suggestion',
        metadata: {
          relatedTaskIds: taskIds,
          confidence: 0.8
        }
      };
      
      setMessages(current => [...current, message]);
      return response;
    } catch (error) {
      console.error('Failed to suggest optimal scheduling:', error);
      return null;
    }
  }, [tasks, getUpcomingTasks, setMessages]);

  // Analytics
  const unreadInsights = useMemo(() => {
    return insights.filter(insight => !insight.isRead);
  }, [insights]);

  const activeGoals = useMemo(() => {
    return goals.filter(goal => goal.isActive);
  }, [goals]);

  const recentMessages = useMemo(() => {
    return messages.slice(-20); // Keep last 20 messages for performance
  }, [messages]);

  return {
    // State
    messages: recentMessages,
    goals,
    insights,
    unreadInsights,
    activeGoals,
    assistantState,
    isTyping,
    isListening,
    
    // Message functions
    sendMessage,
    
    // Voice functions
    startVoiceInput,
    stopVoiceInput,
    
    // Goal functions
    addGoal,
    updateGoal,
    deleteGoal,
    
    // Insight functions
    addInsight,
    markInsightAsRead,
    dismissInsight,
    
    // AI functions
    generateTaskSuggestions,
    generateProductivityInsights,
    generateDailyReport,
    suggestOptimalTaskScheduling,
    
    // Settings
    updateAssistantState: setAssistantState
  };
}

// Helper function to generate AI responses
async function generateAIResponse(
  userMessage: string, 
  context: {
    notes: Note[];
    tasks: Task[];
    recentNotes: Note[];
    analytics: any;
    overdueTasks: Task[];
    upcomingTasks: Task[];
    assistantState: AIAssistantState;
  }
): Promise<{
  content: string;
  type?: ChatMessage['type'];
  metadata?: ChatMessage['metadata'];
}> {
  try {
    const { notes, tasks, recentNotes, analytics, overdueTasks, upcomingTasks, assistantState } = context;
    
    const prompt = spark.llmPrompt`You are Cortex AI, an intelligent productivity assistant. Respond in a ${assistantState.preferredCommunicationStyle} and ${assistantState.personalityTone} tone.

User Context:
- Total notes: ${notes.length}
- Total tasks: ${tasks.length}
- Recent notes: ${recentNotes.map(n => n.title).join(', ')}
- Completion rate: ${analytics.completionRate.toFixed(1)}%
- Overdue tasks: ${overdueTasks.length}
- Upcoming tasks: ${upcomingTasks.length}

User message: "${userMessage}"

Provide a helpful, context-aware response. If the user is asking about productivity, reference their data. If they're asking for task help, suggest actionable items. Be concise but friendly.`;

    const response = await spark.llm(prompt, 'gpt-4o-mini');
    
    // Detect if this is a task-related request
    const isTaskRelated = /task|todo|deadline|schedule|priority/i.test(userMessage.toLowerCase());
    const isProductivityQuery = /productivity|progress|analytics|insight/i.test(userMessage.toLowerCase());
    
    return {
      content: response,
      type: isTaskRelated ? 'task_suggestion' : isProductivityQuery ? 'productivity_insight' : 'text',
      metadata: {
        confidence: 0.8,
        relatedTaskIds: isTaskRelated ? upcomingTasks.slice(0, 3).map(t => t.id) : undefined
      }
    };
  } catch (error) {
    console.error('AI response generation failed:', error);
    return {
      content: "I'm having trouble processing your request right now. Please try again in a moment.",
      type: 'text',
      metadata: { confidence: 0.1 }
    };
  }
}