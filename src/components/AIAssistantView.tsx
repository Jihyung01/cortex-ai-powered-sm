import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Send, 
  Mic, 
  MicOff,
  Sparkle,
  Lightbulb,
  Target,
  TrendUp,
  Clock,
  Star,
  FileText,
  CheckSquare,
  Calendar,
  Zap,
  Users,
  BookOpen,
  Settings,
  Play,
  Pause,
  RotateCcw
} from '@phosphor-icons/react';
import { useNotes } from '@/hooks/use-notes';
import { useTasks } from '@/hooks/use-tasks';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'insight' | 'action';
  metadata?: {
    relatedItems?: string[];
    actionType?: string;
    confidence?: number;
  };
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'productivity' | 'organization' | 'wellness' | 'learning';
  priority: 'high' | 'medium' | 'low';
  action?: () => void;
}

export default function AIAssistantView() {
  const { notes, addNote } = useNotes();
  const { tasks, addTask } = useTasks();
  const isMobile = useIsMobile();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Sample suggestions based on user data
  const suggestions: Suggestion[] = [
    {
      id: 'suggestion-1',
      title: 'Review overdue tasks',
      description: `You have ${tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length} overdue tasks. Let's prioritize them.`,
      category: 'productivity',
      priority: 'high',
      action: () => console.log('Navigate to overdue tasks')
    },
    {
      id: 'suggestion-2',
      title: 'Create weekly review',
      description: 'It\'s been a while since your last review. Create one to track your progress.',
      category: 'productivity',
      priority: 'medium',
      action: () => console.log('Create weekly review template')
    },
    {
      id: 'suggestion-3',
      title: 'Organize notes with tags',
      description: `${notes.filter(n => n.tags.length === 0).length} notes are missing tags. Better organization helps find information faster.`,
      category: 'organization',
      priority: 'medium',
      action: () => console.log('Navigate to untagged notes')
    },
    {
      id: 'suggestion-4',
      title: 'Take a break',
      description: 'You\'ve been working for a while. Consider taking a short break to maintain productivity.',
      category: 'wellness',
      priority: 'low',
      action: () => console.log('Start break timer')
    }
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm your AI productivity assistant. I can help you:

• Analyze your work patterns and suggest improvements
• Create and organize notes and tasks
• Provide personalized productivity tips
• Answer questions about your data

What would you like to explore today?`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with delay
    setTimeout(async () => {
      try {
        const aiResponse = await generateAIResponse(input.trim());
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error generating AI response:', error);
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    const lowerInput = userInput.toLowerCase();
    
    // Simple pattern matching for demo purposes
    if (lowerInput.includes('task') || lowerInput.includes('todo')) {
      const taskCount = tasks.length;
      const completedCount = tasks.filter(t => t.status === 'done').length;
      const completionRate = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
      
      return `You currently have ${taskCount} tasks total, with ${completedCount} completed (${completionRate}% completion rate). 

${tasks.filter(t => t.status === 'todo').length > 0 ? 
  `Your pending tasks include:
${tasks.filter(t => t.status === 'todo').slice(0, 3).map(t => `• ${t.title}`).join('\n')}

Would you like me to help you prioritize these or create a new task?` :
  'Great job! You have no pending tasks. Consider setting new goals for yourself.'
}`;
    }
    
    if (lowerInput.includes('note') || lowerInput.includes('writing')) {
      const noteCount = notes.length;
      const recentNotes = notes.filter(n => 
        new Date(n.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length;
      
      return `You have ${noteCount} notes in total, with ${recentNotes} created this week.

${notes.length > 0 ? 
  `Your most recent notes cover topics like: ${notes.slice(-3).map(n => n.title).join(', ')}.

I notice ${notes.filter(n => n.tags.length === 0).length} notes could benefit from better tagging for easier organization.` :
  'You haven\'t created any notes yet. Would you like me to help you get started with note-taking best practices?'
}`;
    }
    
    if (lowerInput.includes('productivity') || lowerInput.includes('performance')) {
      return `Based on your current data:

📊 **Productivity Insights:**
• You've created ${notes.length} notes and ${tasks.length} tasks
• Task completion rate: ${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
• Most active categories: ${[...notes, ...tasks].reduce((acc, item) => {
  item.tags.forEach(tag => {
    acc[tag] = (acc[tag] || 0) + 1;
  });
  return acc;
}, {} as Record<string, number>)}

🎯 **Recommendations:**
• Consider time-blocking for deep work
• Set up regular review sessions
• Use the Pomodoro Technique for focused work

Would you like specific advice on any of these areas?`;
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return `I can help you in several ways:

🧠 **Analysis & Insights**
• Review your productivity patterns
• Analyze task completion trends
• Suggest organizational improvements

📝 **Content Creation**
• Help brainstorm ideas
• Create structured notes and tasks
• Generate templates for common workflows

⚡ **Productivity Coaching**
• Personalized productivity tips
• Goal setting and tracking
• Work-life balance recommendations

📊 **Data Intelligence**
• Interpret your analytics
• Identify optimization opportunities
• Predict completion timelines

Just ask me about any of these topics, or describe what you're working on!`;
    }
    
    // Default AI response using Spark's LLM
    try {
      const prompt = spark.llmPrompt`You are a helpful AI productivity assistant integrated into a note-taking and task management app called Cortex. 

The user has ${notes.length} notes and ${tasks.length} tasks. Their recent activity shows they're using the app for productivity and organization.

User question: ${userInput}

Provide a helpful, concise response (2-3 sentences) that's relevant to productivity, note-taking, or task management. Be encouraging and practical.`;
      
      const response = await spark.llm(prompt, 'gpt-4o-mini');
      return response;
    } catch (error) {
      // Fallback response if LLM fails
      return `I understand you're asking about "${userInput}". I'm here to help with productivity, note-taking, and task management. Could you provide more specific details about what you'd like assistance with?`;
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(!isListening);
      // In a real implementation, you'd integrate with Web Speech API
      console.log('Voice input toggled:', !isListening);
    } else {
      console.log('Speech recognition not supported');
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.action) {
      suggestion.action();
    }
    
    // Add suggestion as a message
    const suggestionMessage: ChatMessage = {
      id: `suggestion-${Date.now()}`,
      role: 'user',
      content: `Let's work on: ${suggestion.title}`,
      timestamp: new Date(),
      type: 'suggestion'
    };
    
    const responseMessage: ChatMessage = {
      id: `response-${Date.now()}`,
      role: 'assistant',
      content: `Great choice! ${suggestion.description} I'm ready to help you with this. What would you like to do first?`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, suggestionMessage, responseMessage]);
    setActiveTab('chat');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Target className="w-4 h-4" />;
      case 'organization': return <BookOpen className="w-4 h-4" />;
      case 'wellness': return <Star className="w-4 h-4" />;
      case 'learning': return <Lightbulb className="w-4 h-4" />;
      default: return <Sparkle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-700';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      case 'low': return 'border-green-200 bg-green-50 text-green-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                AI Assistant
              </h1>
              <p className="text-muted-foreground">
                Your intelligent productivity companion
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <Zap className="w-3 h-3 mr-1" />
                Online
              </Badge>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full flex flex-col p-0">
              {/* Chat Messages */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "flex gap-3",
                          message.role === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Brain className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                        
                        <div className={cn(
                          "max-w-[80%] space-y-1",
                          message.role === 'user' ? "text-right" : "text-left"
                        )}>
                          <div className={cn(
                            "inline-block px-4 py-2 rounded-lg",
                            message.role === 'user' 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          )}>
                            <div className="whitespace-pre-wrap text-sm">
                              {message.content}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                        
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-accent-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted px-4 py-2 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Chat Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Ask me anything about productivity, notes, or tasks..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isTyping}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVoiceInput}
                    className={cn(isListening && "bg-red-50 border-red-300 text-red-700")}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="p-4 space-y-4">
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "cursor-pointer hover:shadow-md transition-all duration-200",
                      getPriorityColor(suggestion.priority)
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getCategoryIcon(suggestion.category)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{suggestion.title}</h3>
                            <p className="text-sm opacity-80 mb-2">{suggestion.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              <Badge 
                                variant={suggestion.priority === 'high' ? 'destructive' : 'outline'} 
                                className="text-xs"
                              >
                                {suggestion.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendUp className="w-5 h-5" />
                    Productivity Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Notes</span>
                      <Badge variant="outline">{notes.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Tasks</span>
                      <Badge variant="outline">{tasks.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <Badge variant="outline">
                        {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p>• Set up regular review sessions to track progress</p>
                    <p>• Use tags consistently for better organization</p>
                    <p>• Break large tasks into smaller, manageable chunks</p>
                    <p>• Consider time-blocking for deep work sessions</p>
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
