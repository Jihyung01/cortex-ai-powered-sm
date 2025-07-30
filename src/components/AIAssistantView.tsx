import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ProductivityCoaching } from '@/components/ProductivityCoaching';
import { 
  Robot, 
  PaperPlaneTilt, 
  Microphone, 
  MicrophoneSlash,
  Target,
  TrendUp,
  Brain,
  Clock,
  CheckCircle,
  Warning,
  Info,
  Lightbulb,
  Calendar,
  ChartLine,
  Settings
} from '@phosphor-icons/react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export function AIAssistantView() {
  const {
    messages,
    goals,
    insights,
    unreadInsights,
    activeGoals,
    assistantState,
    isTyping,
    isListening,
    sendMessage,
    startVoiceInput,
    stopVoiceInput,
    markInsightAsRead,
    dismissInsight,
    generateDailyReport,
    generateProductivityInsights
  } = useAIAssistant();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice input integration
  const {
    isListening: voiceIsListening,
    isSupported: voiceIsSupported,
    transcript: voiceTranscript,
    interimTranscript,
    error: voiceError,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening,
    resetTranscript,
    processVoiceCommand
  } = useVoiceInput({
    language: 'en-US',
    continuous: false,
    interimResults: true
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle voice input completion
  useEffect(() => {
    if (voiceTranscript && !voiceIsListening) {
      setInputValue(voiceTranscript);
      resetTranscript();
    }
  }, [voiceTranscript, voiceIsListening, resetTranscript]);

  // Update input with interim results during voice input
  useEffect(() => {
    if (voiceIsListening && interimTranscript) {
      setInputValue(voiceTranscript + interimTranscript);
    }
  }, [voiceIsListening, voiceTranscript, interimTranscript]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = async () => {
    if (voiceIsListening) {
      stopVoiceListening();
    } else if (voiceIsSupported) {
      setInputValue(''); // Clear input before starting
      startVoiceListening();
    }
  };

  const quickActions = [
    { label: 'Daily Report', action: () => generateDailyReport() },
    { label: 'Productivity Insights', action: () => generateProductivityInsights() },
    { label: 'Schedule Review', action: () => sendMessage('Help me review my schedule for this week') },
    { label: 'Goal Check-in', action: () => sendMessage('How am I doing with my current goals?') },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Robot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Cortex AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Your intelligent productivity companion</p>
          </div>
        </div>
        
        {unreadInsights.length > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {unreadInsights.length} new insights
          </Badge>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="coaching">Coaching</TabsTrigger>
              <TabsTrigger value="insights">
                Insights {unreadInsights.length > 0 && `(${unreadInsights.length})`}
              </TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
              {/* Messages */}
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="p-2 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <Robot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[70%] rounded-lg px-4 py-3 shadow-sm",
                        message.role === 'user' 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-card border"
                      )}>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        
                        {message.metadata?.relatedTaskIds && message.metadata.relatedTaskIds.length > 0 && (
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {message.metadata.relatedTaskIds.slice(0, 3).map((taskId) => (
                              <Badge key={taskId} variant="secondary" className="text-xs">
                                Related Task
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs opacity-70 mt-2">
                          {format(new Date(message.timestamp), 'HH:mm')}
                        </div>
                      </div>
                      
                      {message.role === 'user' && (
                        <div className="p-2 bg-muted rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium">You</span>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="p-2 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center">
                        <Robot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-card border rounded-lg px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t bg-card/50">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your productivity..."
                      className="pr-12"
                      disabled={isTyping}
                    />
                    {assistantState.voiceInputEnabled && voiceIsSupported && (
                      <Button
                        size="sm"
                        variant={voiceIsListening ? "destructive" : "ghost"}
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={handleVoiceToggle}
                        disabled={isTyping}
                      >
                        {voiceIsListening ? (
                          <MicrophoneSlash className="h-4 w-4" />
                        ) : (
                          <Microphone className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    size="sm"
                  >
                    <PaperPlaneTilt className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Actions */}
                {messages.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={action.action}
                        className="text-xs"
                        disabled={isTyping}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="coaching" className="flex-1 overflow-hidden mt-4">
              <div className="h-full px-6 overflow-auto">
                <ProductivityCoaching />
              </div>
            </TabsContent>

            <TabsContent value="insights" className="flex-1 overflow-hidden mt-4">
              <ScrollArea className="h-full px-6">
                <div className="space-y-4 pb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Productivity Insights</h3>
                    <Button 
                      size="sm" 
                      onClick={generateProductivityInsights}
                      variant="outline"
                    >
                      <TrendUp className="h-4 w-4 mr-2" />
                      Refresh Insights
                    </Button>
                  </div>

                  {insights.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No insights yet. Start using Cortex to see personalized productivity recommendations.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    insights.map((insight) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Card className={cn(
                          "border-l-4",
                          insight.severity === 'high' && "border-l-destructive",
                          insight.severity === 'medium' && "border-l-accent",
                          insight.severity === 'low' && "border-l-primary",
                          !insight.isRead && "bg-muted/30"
                        )}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  insight.type === 'warning' && "bg-destructive/10 text-destructive",
                                  insight.type === 'achievement' && "bg-accent/10 text-accent",
                                  insight.type === 'recommendation' && "bg-primary/10 text-primary",
                                  insight.type === 'pattern' && "bg-secondary/10 text-secondary"
                                )}>
                                  {insight.type === 'warning' && <Warning className="h-4 w-4" />}
                                  {insight.type === 'achievement' && <CheckCircle className="h-4 w-4" />}
                                  {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4" />}
                                  {insight.type === 'pattern' && <TrendUp className="h-4 w-4" />}
                                </div>
                                <div>
                                  <CardTitle className="text-base">{insight.title}</CardTitle>
                                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!insight.isRead && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markInsightAsRead(insight.id)}
                                  >
                                    Mark Read
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => dismissInsight(insight.id)}
                                >
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          {insight.actionItems.length > 0 && (
                            <CardContent className="pt-0">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Recommended Actions:</h4>
                                <ul className="space-y-1">
                                  {insight.actionItems.map((item, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="goals" className="flex-1 overflow-hidden mt-4">
              <ScrollArea className="h-full px-6">
                <div className="space-y-4 pb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Productivity Goals</h3>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>

                  {activeGoals.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No active goals. Set some productivity goals to track your progress.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    activeGoals.map((goal) => {
                      const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                      const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <Card key={goal.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{goal.title}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                              </div>
                              <Badge variant={daysLeft > 7 ? "secondary" : daysLeft > 0 ? "destructive" : "default"}>
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span>Progress</span>
                                  <span className="font-medium">
                                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                                  </span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} goal
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Ends {format(new Date(goal.endDate), 'MMM d, yyyy')}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}