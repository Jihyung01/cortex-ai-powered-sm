import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKV } from '@github/spark/hooks';
import { 
  Heart,
  Activity,
  Brain,
  Moon,
  Coffee,
  Dumbbell,
  Leaf,
  Smile,
  Frown,
  Meh,
  TrendUp,
  TrendDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  BarChart3,
  Settings,
  Zap,
  Shield
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WellnessMetric {
  id: string;
  type: 'stress' | 'energy' | 'mood' | 'focus' | 'sleep' | 'exercise';
  value: number;
  timestamp: Date;
  context?: string;
  triggers?: string[];
}

interface StressAssessment {
  level: number;
  factors: string[];
  recommendations: string[];
  intervention: 'none' | 'breathing' | 'break' | 'exercise' | 'urgent';
  timestamp: Date;
}

interface WellnessGoal {
  id: string;
  title: string;
  type: 'stress_reduction' | 'energy_boost' | 'mood_improvement' | 'sleep_quality';
  target: number;
  current: number;
  deadline: Date;
  strategies: string[];
}

interface ErgonomicReminder {
  id: string;
  type: 'posture' | 'eye_break' | 'hydration' | 'movement' | 'stretching';
  title: string;
  description: string;
  frequency: number; // minutes
  lastReminder: Date;
  completed: boolean;
}

interface BiometricData {
  heartRate?: number;
  hrv?: number; // Heart Rate Variability
  bloodPressure?: { systolic: number; diastolic: number };
  sleepQuality?: number;
  steps?: number;
  timestamp: Date;
}

const moodOptions = [
  { id: 'excellent', value: 5, icon: Smile, color: 'text-green-500', label: 'Excellent' },
  { id: 'good', value: 4, icon: Smile, color: 'text-lime-500', label: 'Good' },
  { id: 'neutral', value: 3, icon: Meh, color: 'text-yellow-500', label: 'Neutral' },
  { id: 'poor', value: 2, icon: Frown, color: 'text-orange-500', label: 'Poor' },
  { id: 'terrible', value: 1, icon: Frown, color: 'text-red-500', label: 'Terrible' }
];

const stressFactors = [
  'Heavy workload', 'Tight deadlines', 'Difficult meetings', 'Technical issues',
  'Lack of sleep', 'Poor nutrition', 'No breaks', 'Noise/distractions',
  'Unclear requirements', 'Team conflicts', 'Work-life imbalance'
];

const wellnessActivities = [
  { id: 'breathing', name: 'Deep Breathing', duration: 3, icon: Leaf },
  { id: 'meditation', name: 'Quick Meditation', duration: 5, icon: Brain },
  { id: 'stretch', name: 'Desk Stretches', duration: 2, icon: Dumbbell },
  { id: 'walk', name: 'Short Walk', duration: 10, icon: Activity },
  { id: 'hydration', name: 'Hydration Break', duration: 1, icon: Coffee },
  { id: 'eye_rest', name: 'Eye Rest (20-20-20)', duration: 1, icon: Shield }
];

export function WellnessView() {
  const [wellnessMetrics, setWellnessMetrics] = useKV<WellnessMetric[]>('wellness-metrics', []);
  const [stressAssessments, setStressAssessments] = useKV<StressAssessment[]>('stress-assessments', []);
  const [wellnessGoals, setWellnessGoals] = useKV<WellnessGoal[]>('wellness-goals', []);
  const [ergonomicReminders, setErgonomicReminders] = useKV<ErgonomicReminder[]>('ergonomic-reminders', []);
  const [biometricData, setBiometricData] = useKV<BiometricData[]>('biometric-data', []);

  // Current state
  const [currentMood, setCurrentMood] = useState<number>(3);
  const [currentStress, setCurrentStress] = useState<number>(30);
  const [currentEnergy, setCurrentEnergy] = useState<number>(70);
  const [selectedStressFactors, setSelectedStressFactors] = useState<string[]>([]);
  const [wellnessRemindersEnabled, setWellnessRemindersEnabled] = useState<boolean>(true);
  const [autoInterventions, setAutoInterventions] = useState<boolean>(true);
  
  // AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [burnoutRisk, setBurnoutRisk] = useState<number>(0);

  // Generate AI wellness recommendations
  const generateWellnessRecommendations = useCallback(async () => {
    try {
      const recentMetrics = wellnessMetrics.slice(-10);
      const avgStress = recentMetrics.filter(m => m.type === 'stress').reduce((acc, m) => acc + m.value, 0) / Math.max(recentMetrics.filter(m => m.type === 'stress').length, 1);
      const avgEnergy = recentMetrics.filter(m => m.type === 'energy').reduce((acc, m) => acc + m.value, 0) / Math.max(recentMetrics.filter(m => m.type === 'energy').length, 1);
      const avgMood = recentMetrics.filter(m => m.type === 'mood').reduce((acc, m) => acc + m.value, 0) / Math.max(recentMetrics.filter(m => m.type === 'mood').length, 1);
      
      const prompt = spark.llmPrompt`Based on wellness data: stress level ${avgStress}%, energy ${avgEnergy}%, mood ${avgMood}/5, and stress factors: ${selectedStressFactors.join(', ')}, provide 3 specific wellness recommendations focusing on stress reduction, energy optimization, and mood improvement.`;
      
      const response = await spark.llm(prompt);
      const recommendations = response.split('\n').filter(rec => rec.trim().length > 0).slice(0, 3);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to generate wellness recommendations:', error);
    }
  }, [wellnessMetrics, selectedStressFactors]);

  // Calculate burnout risk
  const calculateBurnoutRisk = useCallback(() => {
    const recentStress = wellnessMetrics
      .filter(m => m.type === 'stress' && new Date(m.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .map(m => m.value);
    
    const recentEnergy = wellnessMetrics
      .filter(m => m.type === 'energy' && new Date(m.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .map(m => m.value);

    const avgStress = recentStress.reduce((acc, val) => acc + val, 0) / Math.max(recentStress.length, 1);
    const avgEnergy = recentEnergy.reduce((acc, val) => acc + val, 0) / Math.max(recentEnergy.length, 1);
    
    // Calculate risk based on high stress and low energy
    const risk = Math.min(100, Math.max(0, (avgStress + (100 - avgEnergy)) / 2));
    setBurnoutRisk(risk);
    
    if (risk > 70 && autoInterventions) {
      toast.warning('⚠️ High burnout risk detected!', {
        description: 'Consider taking immediate wellness actions',
        action: {
          label: 'Take Break',
          onClick: () => startWellnessActivity('breathing')
        }
      });
    }
  }, [wellnessMetrics, autoInterventions]);

  // Initialize sample data
  useEffect(() => {
    if (wellnessGoals.length === 0) {
      const sampleGoals: WellnessGoal[] = [
        {
          id: 'goal-1',
          title: 'Reduce Daily Stress',
          type: 'stress_reduction',
          target: 30,
          current: 45,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          strategies: ['Regular breaks', 'Deep breathing', 'Time blocking']
        },
        {
          id: 'goal-2',
          title: 'Improve Energy Levels',
          type: 'energy_boost',
          target: 80,
          current: 65,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          strategies: ['Better sleep', 'Exercise', 'Nutrition tracking']
        }
      ];
      setWellnessGoals(sampleGoals);
    }

    if (ergonomicReminders.length === 0) {
      const sampleReminders: ErgonomicReminder[] = [
        {
          id: 'reminder-1',
          type: 'posture',
          title: 'Posture Check',
          description: 'Adjust your posture and ensure your screen is at eye level',
          frequency: 30,
          lastReminder: new Date(),
          completed: false
        },
        {
          id: 'reminder-2',
          type: 'eye_break',
          title: '20-20-20 Rule',
          description: 'Look at something 20 feet away for 20 seconds',
          frequency: 20,
          lastReminder: new Date(),
          completed: false
        },
        {
          id: 'reminder-3',
          type: 'hydration',
          title: 'Hydration Break',
          description: 'Drink a glass of water to stay hydrated',
          frequency: 60,
          lastReminder: new Date(),
          completed: false
        }
      ];
      setErgonomicReminders(sampleReminders);
    }
  }, [wellnessGoals.length, ergonomicReminders.length, setWellnessGoals, setErgonomicReminders]);

  // Initialize recommendations and calculations
  useEffect(() => {
    generateWellnessRecommendations();
    calculateBurnoutRisk();
  }, [generateWellnessRecommendations, calculateBurnoutRisk]);

  const logMoodEntry = () => {
    const newMetric: WellnessMetric = {
      id: `mood-${Date.now()}`,
      type: 'mood',
      value: currentMood,
      timestamp: new Date(),
      context: selectedStressFactors.length > 0 ? `Stress factors: ${selectedStressFactors.join(', ')}` : undefined,
      triggers: selectedStressFactors
    };
    
    setWellnessMetrics(prev => [...prev, newMetric]);
    
    // Also log stress and energy
    const stressMetric: WellnessMetric = {
      id: `stress-${Date.now()}`,
      type: 'stress',
      value: currentStress,
      timestamp: new Date(),
      triggers: selectedStressFactors
    };
    
    const energyMetric: WellnessMetric = {
      id: `energy-${Date.now()}`,
      type: 'energy',
      value: currentEnergy,
      timestamp: new Date()
    };
    
    setWellnessMetrics(prev => [...prev, stressMetric, energyMetric]);
    
    toast.success('✅ Wellness data logged', {
      description: 'Your mood and stress levels have been recorded'
    });
  };

  const startWellnessActivity = (activityId: string) => {
    const activity = wellnessActivities.find(a => a.id === activityId);
    if (!activity) return;
    
    toast.success(`🧘 Started: ${activity.name}`, {
      description: `${activity.duration} minute wellness break`
    });
    
    // Simulate completion
    setTimeout(() => {
      toast.success(`✨ Completed: ${activity.name}`, {
        description: 'Great job taking care of your wellness!'
      });
      
      // Improve metrics slightly
      setCurrentStress(prev => Math.max(0, prev - 5));
      setCurrentEnergy(prev => Math.min(100, prev + 5));
    }, activity.duration * 1000); // Simulated duration
  };

  const handleStressAssessment = async () => {
    try {
      const prompt = spark.llmPrompt`Current stress level: ${currentStress}%, factors: ${selectedStressFactors.join(', ')}, energy: ${currentEnergy}%. Provide stress intervention recommendation: none, breathing, break, exercise, or urgent.`;
      
      const intervention = await spark.llm(prompt) as 'none' | 'breathing' | 'break' | 'exercise' | 'urgent';
      
      const assessment: StressAssessment = {
        level: currentStress,
        factors: selectedStressFactors,
        recommendations: aiRecommendations,
        intervention: intervention.toLowerCase().includes('breathing') ? 'breathing' :
                     intervention.toLowerCase().includes('break') ? 'break' :
                     intervention.toLowerCase().includes('exercise') ? 'exercise' :
                     intervention.toLowerCase().includes('urgent') ? 'urgent' : 'none',
        timestamp: new Date()
      };
      
      setStressAssessments(prev => [...prev, assessment]);
      
      if (assessment.intervention !== 'none') {
        toast.info(`🎯 Recommended: ${assessment.intervention}`, {
          description: 'AI-suggested intervention based on your stress profile'
        });
      }
    } catch (error) {
      console.error('Failed to assess stress:', error);
    }
  };

  const toggleStressFactor = (factor: string) => {
    setSelectedStressFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const completeErgonomicReminder = (reminderId: string) => {
    setErgonomicReminders(prev => prev.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, completed: true, lastReminder: new Date() }
        : reminder
    ));
    
    toast.success('✅ Ergonomic reminder completed');
  };

  const getMoodIcon = (mood: number) => {
    const moodOption = moodOptions.find(m => m.value === mood);
    return moodOption ? moodOption.icon : Meh;
  };

  const getMoodColor = (mood: number) => {
    const moodOption = moodOptions.find(m => m.value === mood);
    return moodOption ? moodOption.color : 'text-gray-500';
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900/20 dark:to-blue-900/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-green-600" weight="duotone" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Wellness Integration
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive wellness monitoring with stress assessment, ergonomic reminders, and proactive health interventions
          </p>
        </motion.div>

        {/* Burnout Risk Alert */}
        <AnimatePresence>
          {burnoutRisk > 60 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-auto max-w-2xl"
            >
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600" weight="duotone" />
                    <div className="flex-1">
                      <p className="font-semibold text-orange-800 dark:text-orange-200">
                        Elevated Burnout Risk: {Math.round(burnoutRisk)}%
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Consider taking immediate wellness actions to prevent burnout
                      </p>
                    </div>
                    <Button
                      onClick={() => startWellnessActivity('breathing')}
                      variant="outline"
                      size="sm"
                      className="border-orange-200"
                    >
                      Quick Relief
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wellness Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Wellness Dashboard
                </CardTitle>
                <CardDescription>
                  Track and improve your physical and mental well-being
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="current" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="current">Current State</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="interventions">Interventions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="current" className="space-y-6">
                    {/* Mood Check-in */}
                    <div>
                      <h4 className="font-semibold mb-3">How are you feeling right now?</h4>
                      <div className="grid grid-cols-5 gap-2 mb-4">
                        {moodOptions.map(mood => {
                          const Icon = mood.icon;
                          return (
                            <button
                              key={mood.id}
                              onClick={() => setCurrentMood(mood.value)}
                              className={cn(
                                "p-3 rounded-lg border-2 transition-all",
                                currentMood === mood.value
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <Icon className={cn("w-6 h-6 mx-auto mb-1", mood.color)} weight="duotone" />
                              <p className="text-xs font-medium">{mood.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Stress & Energy Levels */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Stress Level: {currentStress}%
                        </label>
                        <Slider
                          value={[currentStress]}
                          onValueChange={(value) => setCurrentStress(value[0])}
                          max={100}
                          step={5}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Relaxed</span>
                          <span>Overwhelmed</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Energy Level: {currentEnergy}%
                        </label>
                        <Slider
                          value={[currentEnergy]}
                          onValueChange={(value) => setCurrentEnergy(value[0])}
                          max={100}
                          step={5}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Exhausted</span>
                          <span>Energized</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stress Factors */}
                    <div>
                      <h4 className="font-semibold mb-3">Current Stress Factors</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {stressFactors.map(factor => (
                          <button
                            key={factor}
                            onClick={() => toggleStressFactor(factor)}
                            className={cn(
                              "p-2 text-left text-sm rounded border transition-all",
                              selectedStressFactors.includes(factor)
                                ? "border-red-200 bg-red-50 text-red-800"
                                : "border-border hover:border-red-200"
                            )}
                          >
                            {factor}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={logMoodEntry} className="flex-1">
                        <Heart className="w-4 h-4 mr-2" />
                        Log Wellness Data
                      </Button>
                      <Button onClick={handleStressAssessment} variant="outline" className="flex-1">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Stress Assessment
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="trends" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <TrendUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold">
                          {wellnessMetrics.filter(m => m.type === 'mood').length > 0
                            ? (wellnessMetrics.filter(m => m.type === 'mood').reduce((acc, m) => acc + m.value, 0) / wellnessMetrics.filter(m => m.type === 'mood').length).toFixed(1)
                            : '3.0'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">Avg Mood</p>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold">
                          {wellnessMetrics.filter(m => m.type === 'energy').length > 0
                            ? Math.round(wellnessMetrics.filter(m => m.type === 'energy').reduce((acc, m) => acc + m.value, 0) / wellnessMetrics.filter(m => m.type === 'energy').length)
                            : 65
                          }%
                        </p>
                        <p className="text-sm text-muted-foreground">Avg Energy</p>
                      </div>
                      
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <p className="text-2xl font-bold">{Math.round(burnoutRisk)}%</p>
                        <p className="text-sm text-muted-foreground">Burnout Risk</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Weekly Wellness Trend</h4>
                      <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-end justify-between p-4">
                        {Array.from({ length: 7 }, (_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div 
                              className="w-4 bg-gradient-to-t from-green-500 to-blue-500 rounded-t"
                              style={{ height: `${Math.random() * 60 + 20}px` }}
                            />
                            <span className="text-xs mt-1 text-muted-foreground">
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="goals" className="space-y-4">
                    <div className="space-y-4">
                      {wellnessGoals.map(goal => (
                        <motion.div
                          key={goal.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold">{goal.title}</h5>
                            <Badge variant="outline">
                              {Math.round((goal.current / goal.target) * 100)}%
                            </Badge>
                          </div>
                          <Progress value={(goal.current / goal.target) * 100} className="mb-2" />
                          <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>Current: {goal.current}{goal.type.includes('stress') ? '%' : goal.type.includes('energy') ? '%' : ''}</span>
                            <span>Target: {goal.target}{goal.type.includes('stress') ? '%' : goal.type.includes('energy') ? '%' : ''}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Strategies: {goal.strategies.join(', ')}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="interventions" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Quick Wellness Activities</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {wellnessActivities.map(activity => {
                          const Icon = activity.icon;
                          return (
                            <button
                              key={activity.id}
                              onClick={() => startWellnessActivity(activity.id)}
                              className="p-3 border rounded-lg hover:bg-accent/50 transition-colors text-left"
                            >
                              <Icon className="w-5 h-5 mb-2 text-primary" weight="duotone" />
                              <p className="font-medium text-sm">{activity.name}</p>
                              <p className="text-xs text-muted-foreground">{activity.duration} min</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">AI Recommendations</h4>
                      <div className="space-y-2">
                        {aiRecommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Wellness Reminders</span>
                        <Switch checked={wellnessRemindersEnabled} onCheckedChange={setWellnessRemindersEnabled} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Auto Interventions</span>
                        <Switch checked={autoInterventions} onCheckedChange={setAutoInterventions} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ergonomic Reminders & Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  Ergonomic Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {ergonomicReminders.map(reminder => (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-3 border rounded-lg transition-all",
                          reminder.completed ? "bg-green-50 dark:bg-green-900/20 border-green-200" : "hover:bg-accent/50"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm">{reminder.title}</h5>
                          {reminder.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{reminder.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Every {reminder.frequency}m</span>
                          {!reminder.completed && (
                            <Button
                              onClick={() => completeErgonomicReminder(reminder.id)}
                              size="sm"
                              variant="outline"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Wellness Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {React.createElement(getMoodIcon(currentMood), {
                      className: cn("w-8 h-8", getMoodColor(currentMood)),
                      weight: "duotone"
                    })}
                  </div>
                  <p className="text-lg font-semibold">
                    {moodOptions.find(m => m.value === currentMood)?.label}
                  </p>
                  <p className="text-sm text-muted-foreground">Current Mood</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{wellnessMetrics.length}</p>
                    <p className="text-xs text-muted-foreground">Total Logs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stressAssessments.length}</p>
                    <p className="text-xs text-muted-foreground">Assessments</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">7</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">{ergonomicReminders.filter(r => r.completed).length}</p>
                  <p className="text-xs text-muted-foreground">Reminders Completed</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default WellnessView;