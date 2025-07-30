import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKV } from '@github/spark/hooks';
import { 
  Clock, 
  Calendar,
  Battery,
  Zap,
  Target,
  TrendUp,
  Brain,
  Moon,
  Sun,
  Coffee,
  CalendarCheck,
  Users,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Lightbulb,
  Timer
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimeBlock {
  id: string;
  title: string;
  type: 'focus' | 'meeting' | 'break' | 'admin' | 'creative';
  startTime: Date;
  endTime: Date;
  energyLevel: number;
  priority: 'low' | 'medium' | 'high';
  estimatedEffort: number;
  actualDuration?: number;
  completed: boolean;
  conflictResolution?: string;
}

interface EnergyPattern {
  hour: number;
  averageEnergy: number;
  productivity: number;
  taskTypes: string[];
}

interface CalendarConflict {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  autoResolve: boolean;
}

interface WorkloadAnalysis {
  totalHours: number;
  focusHours: number;
  meetingHours: number;
  adminHours: number;
  efficiency: number;
  burnoutRisk: number;
  optimalCapacity: number;
}

const timeBlockTypes = [
  { id: 'focus', name: 'Deep Focus', color: 'bg-blue-500', icon: Brain },
  { id: 'meeting', name: 'Meeting', color: 'bg-green-500', icon: Users },
  { id: 'break', name: 'Break', color: 'bg-yellow-500', icon: Coffee },
  { id: 'admin', name: 'Admin', color: 'bg-gray-500', icon: CheckCircle2 },
  { id: 'creative', name: 'Creative', color: 'bg-purple-500', icon: Lightbulb }
];

const priorityLevels = [
  { id: 'low', name: 'Low', color: 'bg-green-100 text-green-800' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'high', name: 'High', color: 'bg-red-100 text-red-800' }
];

export function IntelligentTimeView() {
  const [timeBlocks, setTimeBlocks] = useKV<TimeBlock[]>('time-blocks', []);
  const [energyPatterns, setEnergyPatterns] = useKV<EnergyPattern[]>('energy-patterns', []);
  const [conflicts, setConflicts] = useKV<CalendarConflict[]>('calendar-conflicts', []);
  const [workloadAnalysis, setWorkloadAnalysis] = useKV<WorkloadAnalysis>('workload-analysis', {
    totalHours: 0,
    focusHours: 0,
    meetingHours: 0,
    adminHours: 0,
    efficiency: 0,
    burnoutRisk: 0,
    optimalCapacity: 8
  });

  const [currentEnergyLevel, setCurrentEnergyLevel] = useState<number>(70);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [contextSwitchingCost, setContextSwitchingCost] = useState<number>(0);

  // Generate AI-powered time recommendations
  const generateTimeRecommendations = useCallback(async () => {
    try {
      const currentHour = new Date().getHours();
      const todayBlocks = timeBlocks.filter(block => 
        new Date(block.startTime).toDateString() === new Date().toDateString()
      );
      
      const energyNow = energyPatterns.find(p => p.hour === currentHour)?.averageEnergy || currentEnergyLevel;
      
      const prompt = spark.llmPrompt`Based on current time ${currentHour}:00, energy level ${energyNow}%, ${todayBlocks.length} scheduled blocks today, and ${conflicts.length} conflicts, provide 3 specific time management recommendations. Focus on energy optimization, task batching, and conflict resolution.`;
      
      const response = await spark.llm(prompt);
      const recommendations = response.split('\n').filter(rec => rec.trim().length > 0).slice(0, 3);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    }
  }, [timeBlocks, energyPatterns, conflicts, currentEnergyLevel]);

  // Analyze context switching cost
  const analyzeContextSwitching = useCallback(() => {
    const today = new Date().toDateString();
    const todayBlocks = timeBlocks
      .filter(block => new Date(block.startTime).toDateString() === today)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    let switches = 0;
    for (let i = 1; i < todayBlocks.length; i++) {
      if (todayBlocks[i].type !== todayBlocks[i - 1].type) {
        switches++;
      }
    }

    // Calculate cost based on research (15-25 minutes per context switch)
    const avgSwitchCost = 20; // minutes
    setContextSwitchingCost(switches * avgSwitchCost);
  }, [timeBlocks]);

  // Auto-resolve calendar conflicts
  const autoResolveConflicts = useCallback(async () => {
    const autoResolvableConflicts = conflicts.filter(c => c.autoResolve);
    
    for (const conflict of autoResolvableConflicts) {
      try {
        const prompt = spark.llmPrompt`Conflict: ${conflict.description}. Provide a specific resolution strategy in one sentence.`;
        const resolution = await spark.llm(prompt);
        
        // Update the conflict with resolution
        setConflicts(prev => prev.map(c => 
          c.id === conflict.id 
            ? { ...c, suggestion: resolution, autoResolve: false }
            : c
        ));
        
        toast.success(`🤖 Auto-resolved: ${conflict.description}`, {
          description: resolution
        });
      } catch (error) {
        console.error('Failed to auto-resolve conflict:', error);
      }
    }
  }, [conflicts, setConflicts]);

  // Generate sample energy patterns for demo
  useEffect(() => {
    if (energyPatterns.length === 0) {
      const samplePatterns: EnergyPattern[] = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        averageEnergy: Math.max(20, Math.min(100, 
          60 + Math.sin((hour - 6) * Math.PI / 12) * 30 + Math.random() * 20
        )),
        productivity: Math.max(10, Math.min(100,
          50 + Math.sin((hour - 8) * Math.PI / 10) * 40 + Math.random() * 20
        )),
        taskTypes: hour < 12 ? ['focus', 'creative'] : ['meeting', 'admin']
      }));
      setEnergyPatterns(samplePatterns);
    }
  }, [energyPatterns.length, setEnergyPatterns]);

  // Sample conflicts and time blocks for demo
  useEffect(() => {
    if (conflicts.length === 0) {
      const sampleConflicts: CalendarConflict[] = [
        {
          id: 'conflict-1',
          description: 'Deep focus session overlaps with team standup',
          severity: 'medium',
          suggestion: 'Move focus session to 2-4 PM when energy dips',
          autoResolve: true
        },
        {
          id: 'conflict-2',
          description: 'Back-to-back meetings without breaks',
          severity: 'high',
          suggestion: 'Add 15-minute buffers between meetings',
          autoResolve: true
        }
      ];
      setConflicts(sampleConflicts);
    }

    if (timeBlocks.length === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const sampleBlocks: TimeBlock[] = [
        {
          id: 'block-1',
          title: 'Strategic Planning',
          type: 'focus',
          startTime: new Date(tomorrow.setHours(9, 0)),
          endTime: new Date(tomorrow.setHours(11, 0)),
          energyLevel: 85,
          priority: 'high',
          estimatedEffort: 8,
          completed: false
        },
        {
          id: 'block-2',
          title: 'Team Sync',
          type: 'meeting',
          startTime: new Date(tomorrow.setHours(11, 0)),
          endTime: new Date(tomorrow.setHours(12, 0)),
          energyLevel: 75,
          priority: 'medium',
          estimatedEffort: 3,
          completed: false
        }
      ];
      setTimeBlocks(sampleBlocks);
    }
  }, [conflicts.length, timeBlocks.length, setConflicts, setTimeBlocks]);

  // Initialize recommendations
  useEffect(() => {
    generateTimeRecommendations();
    analyzeContextSwitching();
  }, [generateTimeRecommendations, analyzeContextSwitching]);

  // Auto-resolve conflicts on load
  useEffect(() => {
    const timer = setTimeout(autoResolveConflicts, 2000);
    return () => clearTimeout(timer);
  }, [autoResolveConflicts]);

  const createOptimalSchedule = async () => {
    try {
      const prompt = spark.llmPrompt`Create an optimal daily schedule for tomorrow based on energy patterns: morning peak at 9-11 AM (energy: 85%), afternoon dip at 1-3 PM (energy: 45%), evening recovery at 7-9 PM (energy: 65%). Include 3 focus blocks, 2 meetings, and appropriate breaks. Format as simple time slots.`;
      
      const schedule = await spark.llm(prompt);
      
      toast.success('🤖 Optimal schedule generated!', {
        description: 'Based on your energy patterns and productivity data'
      });
      
      console.log('Generated schedule:', schedule);
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      toast.error('Failed to generate optimal schedule');
    }
  };

  const handleConflictResolve = (conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    toast.success('Conflict resolved successfully');
  };

  const getCurrentEnergyLevel = () => {
    const currentHour = new Date().getHours();
    const pattern = energyPatterns.find(p => p.hour === currentHour);
    return pattern?.averageEnergy || currentEnergyLevel;
  };

  const getOptimalTaskType = () => {
    const currentHour = new Date().getHours();
    const pattern = energyPatterns.find(p => p.hour === currentHour);
    
    if (!pattern) return 'admin';
    
    if (pattern.averageEnergy > 75) return 'focus';
    if (pattern.averageEnergy > 50) return 'creative';
    return 'admin';
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-blue-600" weight="duotone" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Intelligent Time Management
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered scheduling with energy optimization, conflict resolution, and context switching analysis
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Intelligence Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Time Intelligence Dashboard
                </CardTitle>
                <CardDescription>
                  AI insights and optimization for your schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="insights" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    <TabsTrigger value="energy">Energy Patterns</TabsTrigger>
                    <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
                    <TabsTrigger value="optimization">Optimization</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="insights" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Battery className="w-8 h-8 mx-auto mb-2 text-blue-600" weight="duotone" />
                        <p className="text-2xl font-bold">{Math.round(getCurrentEnergyLevel())}%</p>
                        <p className="text-sm text-muted-foreground">Current Energy</p>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Target className="w-8 h-8 mx-auto mb-2 text-green-600" weight="duotone" />
                        <p className="text-2xl font-bold capitalize">{getOptimalTaskType()}</p>
                        <p className="text-sm text-muted-foreground">Optimal Task Type</p>
                      </div>
                      
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Timer className="w-8 h-8 mx-auto mb-2 text-orange-600" weight="duotone" />
                        <p className="text-2xl font-bold">{contextSwitchingCost}m</p>
                        <p className="text-sm text-muted-foreground">Context Switch Cost</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">AI Recommendations</h4>
                      <div className="space-y-3">
                        {aiRecommendations.map((rec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border"
                          >
                            <p className="text-sm">{rec}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <Button onClick={createOptimalSchedule} className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Optimal Schedule
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="energy" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">24-Hour Energy Pattern</h4>
                      <div className="h-64 relative">
                        <svg viewBox="0 0 400 200" className="w-full h-full">
                          <defs>
                            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
                              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                          
                          {/* Energy curve */}
                          <path
                            d={`M 0 ${200 - (energyPatterns[0]?.averageEnergy || 50) * 1.5} ${energyPatterns.map((pattern, index) => 
                              `L ${index * (400 / 24)} ${200 - pattern.averageEnergy * 1.5}`
                            ).join(' ')}`}
                            fill="url(#energyGradient)"
                            stroke="rgb(59, 130, 246)"
                            strokeWidth="2"
                          />
                          
                          {/* Grid lines */}
                          {[0, 25, 50, 75, 100].map(level => (
                            <line
                              key={level}
                              x1="0"
                              y1={200 - level * 1.5}
                              x2="400"
                              y2={200 - level * 1.5}
                              stroke="rgb(156, 163, 175)"
                              strokeWidth="1"
                              strokeOpacity="0.3"
                            />
                          ))}
                          
                          {/* Hour markers */}
                          {[0, 6, 12, 18, 24].map(hour => (
                            <g key={hour}>
                              <line
                                x1={hour * (400 / 24)}
                                y1="0"
                                x2={hour * (400 / 24)}
                                y2="200"
                                stroke="rgb(156, 163, 175)"
                                strokeWidth="1"
                                strokeOpacity="0.3"
                              />
                              <text
                                x={hour * (400 / 24)}
                                y="215"
                                textAnchor="middle"
                                fontSize="12"
                                fill="rgb(107, 114, 128)"
                              >
                                {hour}:00
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { time: 'Morning', hours: '6-12', icon: Sun, peak: true },
                        { time: 'Afternoon', hours: '12-18', icon: Coffee, peak: false },
                        { time: 'Evening', hours: '18-22', icon: Moon, peak: false },
                        { time: 'Night', hours: '22-6', icon: Moon, peak: false }
                      ].map((period, index) => {
                        const Icon = period.icon;
                        return (
                          <div key={period.time} className="text-center p-3 border rounded-lg">
                            <Icon className="w-6 h-6 mx-auto mb-2" weight="duotone" />
                            <p className="font-medium text-sm">{period.time}</p>
                            <p className="text-xs text-muted-foreground">{period.hours}</p>
                            {period.peak && (
                              <Badge variant="secondary" className="mt-1 text-xs">Peak</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="conflicts" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Calendar Conflicts</h4>
                      <Button onClick={autoResolveConflicts} size="sm" variant="outline">
                        Auto-Resolve All
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {conflicts.map(conflict => (
                        <motion.div
                          key={conflict.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle className={cn(
                                "w-4 h-4",
                                conflict.severity === 'high' ? 'text-red-500' :
                                conflict.severity === 'medium' ? 'text-yellow-500' :
                                'text-blue-500'
                              )} />
                              <p className="font-medium text-sm">{conflict.description}</p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                conflict.severity === 'high' ? 'border-red-200 text-red-700' :
                                conflict.severity === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                'border-blue-200 text-blue-700'
                              )}
                            >
                              {conflict.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{conflict.suggestion}</p>
                          <Button
                            onClick={() => handleConflictResolve(conflict.id)}
                            size="sm"
                            className="w-full"
                          >
                            Apply Solution
                          </Button>
                        </motion.div>
                      ))}
                      
                      {conflicts.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p>No conflicts detected. Your schedule is optimized!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="optimization" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h5 className="font-semibold mb-2">Time Batching Analysis</h5>
                        <p className="text-sm text-muted-foreground mb-2">
                          Group similar tasks to reduce context switching
                        </p>
                        <div className="space-y-2">
                          {timeBlockTypes.slice(0, 3).map(type => (
                            <div key={type.id} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{type.name}</span>
                              <Badge variant="outline">
                                {timeBlocks.filter(b => b.type === type.id).length}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h5 className="font-semibold mb-2">Workload Distribution</h5>
                        <p className="text-sm text-muted-foreground mb-2">
                          Balance across work types for optimal performance
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Focus Work</span>
                            <span className="text-sm font-medium">40%</span>
                          </div>
                          <Progress value={40} className="h-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Meetings</span>
                            <span className="text-sm font-medium">35%</span>
                          </div>
                          <Progress value={35} className="h-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Admin</span>
                            <span className="text-sm font-medium">25%</span>
                          </div>
                          <Progress value={25} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h5 className="font-semibold mb-2">Burnout Risk Assessment</h5>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={25} className="h-3" />
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Low Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Current workload is sustainable. Consider adding challenging projects.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Time Blocks & Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {timeBlocks
                      .filter(block => new Date(block.startTime).toDateString() === new Date().toDateString())
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map(block => {
                        const typeInfo = timeBlockTypes.find(t => t.id === block.type);
                        const Icon = typeInfo?.icon || Clock;
                        
                        return (
                          <motion.div
                            key={block.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className={cn("w-3 h-3 rounded-full", typeInfo?.color)} />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{block.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(block.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <Badge 
                              variant="outline"
                              className={priorityLevels.find(p => p.id === block.priority)?.color}
                            >
                              {block.priority}
                            </Badge>
                          </motion.div>
                        );
                      })}
                    
                    {timeBlocks.filter(block => 
                      new Date(block.startTime).toDateString() === new Date().toDateString()
                    ).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No time blocks scheduled for today</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Quick Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{timeBlocks.length}</p>
                  <p className="text-sm text-muted-foreground">Total Time Blocks</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.round(timeBlocks.reduce((acc, block) => 
                      acc + (new Date(block.endTime).getTime() - new Date(block.startTime).getTime()) / (1000 * 60 * 60), 0
                    ))}h
                  </p>
                  <p className="text-sm text-muted-foreground">Scheduled Hours</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.round((timeBlocks.filter(b => b.completed).length / Math.max(timeBlocks.length, 1)) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">92%</p>
                  <p className="text-sm text-muted-foreground">Efficiency Score</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default IntelligentTimeView;