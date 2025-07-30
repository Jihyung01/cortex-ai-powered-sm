import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKV } from '@github/spark/hooks';
import { 
  Brain, 
  Volume2, 
  VolumeX, 
  Clock, 
  Target, 
  Zap,
  Eye,
  Music,
  Waves,
  Wind,
  Coffee,
  Play,
  Pause,
  SkipForward,
  Settings
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FocusSession {
  id: string;
  type: 'deep-focus' | 'creative' | 'analytical' | 'collaborative';
  duration: number;
  distractionLevel: number;
  flowStateAchieved: boolean;
  energyLevel: number;
  completedAt: Date;
}

interface DistractionPattern {
  source: string;
  frequency: number;
  impact: number;
  timeOfDay: string;
}

interface FlowState {
  isActive: boolean;
  duration: number;
  intensity: number;
  triggers: string[];
}

const soundscapeTypes = [
  { id: 'forest', name: 'Forest Ambience', icon: '🌲', description: 'Natural forest sounds with birds and wind' },
  { id: 'rain', name: 'Rain & Thunder', icon: '🌧️', description: 'Gentle rain with distant thunder' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', description: 'Rhythmic ocean waves and seagulls' },
  { id: 'cafe', name: 'Coffee Shop', icon: '☕', description: 'Ambient cafe chatter and espresso machine' },
  { id: 'library', name: 'Library', icon: '📚', description: 'Quiet page turning and distant footsteps' },
  { id: 'fire', name: 'Crackling Fire', icon: '🔥', description: 'Warm fireplace with gentle crackling' },
  { id: 'city', name: 'City Rain', icon: '🌆', description: 'Urban rain with distant traffic' },
  { id: 'space', name: 'Space Station', icon: '🚀', description: 'Futuristic ambient hum' }
];

const workTypes = [
  { id: 'deep-focus', name: 'Deep Focus', color: 'bg-blue-500', description: 'Complex analytical work' },
  { id: 'creative', name: 'Creative', color: 'bg-purple-500', description: 'Design and brainstorming' },
  { id: 'analytical', name: 'Analytical', color: 'bg-green-500', description: 'Data analysis and research' },
  { id: 'collaborative', name: 'Collaborative', color: 'bg-orange-500', description: 'Team meetings and communication' }
];

export function FocusAssistantView() {
  const [focusSessions, setFocusSessions] = useKV<FocusSession[]>('focus-sessions', []);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [flowState, setFlowState] = useKV<FlowState>('flow-state', {
    isActive: false,
    duration: 0,
    intensity: 0,
    triggers: []
  });
  const [distractionPatterns, setDistractionPatterns] = useKV<DistractionPattern[]>('distraction-patterns', []);
  
  // Focus settings
  const [selectedWorkType, setSelectedWorkType] = useState<string>('deep-focus');
  const [sessionDuration, setSessionDuration] = useState<number>(25); // Pomodoro default
  const [distractionBlocking, setDistractionBlocking] = useState<boolean>(true);
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState<boolean>(false);
  const [selectedSoundscape, setSelectedSoundscape] = useState<string>('forest');
  const [soundscapeVolume, setSoundscapeVolume] = useState<number>(50);
  
  // Session state
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionProgress, setSessionProgress] = useState<number>(0);
  const [energyLevel, setEnergyLevel] = useState<number>(70);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  
  // AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [optimalBreakTime, setOptimalBreakTime] = useState<string>('');

  // Generate AI-powered recommendations
  const generateRecommendations = useCallback(async () => {
    try {
      const recentSessions = focusSessions.slice(-10);
      const avgFlowDuration = recentSessions.reduce((acc, session) => acc + (session.flowStateAchieved ? session.duration : 0), 0) / recentSessions.length;
      
      const prompt = spark.llmPrompt`Based on recent focus sessions with average flow duration of ${avgFlowDuration} minutes, current energy level of ${energyLevel}%, and ${distractionCount} distractions today, provide 3 specific recommendations for optimizing focus and productivity. Format as brief, actionable suggestions.`;
      
      const response = await spark.llm(prompt);
      const recommendations = response.split('\n').filter(rec => rec.trim().length > 0).slice(0, 3);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    }
  }, [focusSessions, energyLevel, distractionCount]);

  // Calculate optimal break timing
  const calculateOptimalBreakTime = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // AI logic for optimal break timing based on energy patterns
    let recommendedTime = '';
    
    if (currentHour < 10) {
      recommendedTime = 'Morning energy is high - take a 5-minute break in 45 minutes';
    } else if (currentHour < 14) {
      recommendedTime = 'Pre-lunch focus - take a 10-minute break in 30 minutes';
    } else if (currentHour < 16) {
      recommendedTime = 'Post-lunch dip - take a 15-minute energizing break now';
    } else {
      recommendedTime = 'Evening focus - take micro-breaks every 20 minutes';
    }
    
    setOptimalBreakTime(recommendedTime);
  }, []);

  // Flow state detection simulation
  useEffect(() => {
    if (isSessionActive && sessionProgress > 20) {
      const flowIntensity = Math.max(0, 100 - distractionCount * 10 - (100 - energyLevel));
      
      if (flowIntensity > 70 && !flowState.isActive) {
        setFlowState(prev => ({
          ...prev,
          isActive: true,
          intensity: flowIntensity,
          triggers: [`${selectedWorkType} work`, `${selectedSoundscape} soundscape`]
        }));
        
        toast.success('🧠 Flow state detected! Optimizing environment...', {
          description: 'Minimizing distractions and adjusting ambient sounds',
        });
      }
    }
  }, [isSessionActive, sessionProgress, distractionCount, energyLevel, selectedWorkType, selectedSoundscape, flowState.isActive, setFlowState]);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionProgress(prev => {
          const newProgress = prev + (100 / (sessionDuration * 60)); // Convert minutes to seconds
          
          if (newProgress >= 100) {
            completeSession();
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isSessionActive, sessionDuration]);

  // Initialize recommendations
  useEffect(() => {
    generateRecommendations();
    calculateOptimalBreakTime();
  }, [generateRecommendations, calculateOptimalBreakTime]);

  const startFocusSession = () => {
    const newSession: FocusSession = {
      id: `session-${Date.now()}`,
      type: selectedWorkType as any,
      duration: sessionDuration,
      distractionLevel: 0,
      flowStateAchieved: false,
      energyLevel: energyLevel,
      completedAt: new Date()
    };
    
    setCurrentSession(newSession);
    setIsSessionActive(true);
    setSessionProgress(0);
    setDistractionCount(0);
    
    if (ambientSoundEnabled) {
      toast.success(`🎵 ${soundscapeTypes.find(s => s.id === selectedSoundscape)?.name} soundscape activated`);
    }
    
    toast.success('🎯 Focus session started!', {
      description: `${sessionDuration} minutes of ${workTypes.find(w => w.id === selectedWorkType)?.name} work`
    });
  };

  const pauseSession = () => {
    setIsSessionActive(false);
    toast.info('⏸️ Session paused');
  };

  const resumeSession = () => {
    setIsSessionActive(true);
    toast.info('▶️ Session resumed');
  };

  const completeSession = () => {
    if (currentSession) {
      const completedSession: FocusSession = {
        ...currentSession,
        distractionLevel: distractionCount,
        flowStateAchieved: flowState.isActive,
        completedAt: new Date()
      };
      
      setFocusSessions(prev => [...prev, completedSession]);
    }
    
    setIsSessionActive(false);
    setCurrentSession(null);
    setSessionProgress(0);
    setFlowState(prev => ({ ...prev, isActive: false, duration: 0 }));
    
    toast.success('🎉 Focus session completed!', {
      description: flowState.isActive ? 'Flow state achieved!' : 'Great work!'
    });
  };

  const simulateDistraction = () => {
    setDistractionCount(prev => prev + 1);
    
    // Add distraction pattern
    const newPattern: DistractionPattern = {
      source: ['notification', 'social media', 'email', 'phone call'][Math.floor(Math.random() * 4)],
      frequency: 1,
      impact: Math.floor(Math.random() * 10) + 1,
      timeOfDay: new Date().toTimeString().slice(0, 5)
    };
    
    setDistractionPatterns(prev => [...prev, newPattern]);
    
    toast.warning('⚠️ Distraction detected', {
      description: `${newPattern.source} - Impact level: ${newPattern.impact}/10`
    });
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-600" weight="duotone" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Focus Assistant
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered focus optimization with distraction blocking, adaptive soundscapes, and flow state detection
          </p>
        </motion.div>

        {/* Flow State Indicator */}
        <AnimatePresence>
          {flowState.isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-4 right-4 z-50"
            >
              <Card className="glass-elevated border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Zap className="w-6 h-6 text-purple-600" weight="fill" />
                      <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-20" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-600">Flow State Active</p>
                      <p className="text-xs text-muted-foreground">Intensity: {flowState.intensity}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Focus Session Control */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Focus Session
                </CardTitle>
                <CardDescription>
                  Configure and start your AI-optimized focus session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isSessionActive && !currentSession ? (
                  <Tabs defaultValue="setup" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="setup">Setup</TabsTrigger>
                      <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="setup" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Work Type</label>
                          <Select value={selectedWorkType} onValueChange={setSelectedWorkType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {workTypes.map(type => (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", type.color)} />
                                    {type.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Duration (minutes)</label>
                          <Select value={sessionDuration.toString()} onValueChange={(value) => setSessionDuration(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                              <SelectItem value="90">90 minutes (Ultradian)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Smart Distraction Blocking</p>
                            <p className="text-sm text-muted-foreground">AI-powered website and app blocking</p>
                          </div>
                          <Switch checked={distractionBlocking} onCheckedChange={setDistractionBlocking} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Adaptive Soundscape</p>
                            <p className="text-sm text-muted-foreground">AI-generated ambient sounds</p>
                          </div>
                          <Switch checked={ambientSoundEnabled} onCheckedChange={setAmbientSoundEnabled} />
                        </div>
                      </div>
                      
                      {ambientSoundEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="text-sm font-medium">Soundscape</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {soundscapeTypes.map(soundscape => (
                                <button
                                  key={soundscape.id}
                                  onClick={() => setSelectedSoundscape(soundscape.id)}
                                  className={cn(
                                    "p-3 rounded-lg border text-left transition-all",
                                    selectedSoundscape === soundscape.id
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{soundscape.icon}</span>
                                    <span className="font-medium text-sm">{soundscape.name}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{soundscape.description}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Volume: {soundscapeVolume}%</label>
                            <Slider
                              value={[soundscapeVolume]}
                              onValueChange={(value) => setSoundscapeVolume(value[0])}
                              max={100}
                              step={5}
                              className="mt-2"
                            />
                          </div>
                        </motion.div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium">Current Energy Level: {energyLevel}%</label>
                        <Slider
                          value={[energyLevel]}
                          onValueChange={(value) => setEnergyLevel(value[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      
                      <Button onClick={startFocusSession} className="w-full" size="lg">
                        <Play className="w-4 h-4 mr-2" />
                        Start Focus Session
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="insights" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">AI Recommendations</h4>
                          <div className="space-y-2">
                            {aiRecommendations.map((rec, index) => (
                              <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Optimal Break Timing</h4>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm">{optimalBreakTime}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Recent Distraction Patterns</h4>
                          <div className="space-y-2">
                            {distractionPatterns.slice(-3).map((pattern, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                                <span className="text-sm capitalize">{pattern.source}</span>
                                <Badge variant="outline">Impact: {pattern.impact}/10</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        {workTypes.find(w => w.id === selectedWorkType)?.name} Session
                      </h3>
                      <div className="text-3xl font-bold mb-4">
                        {Math.floor((sessionDuration * 60 * (100 - sessionProgress)) / 100 / 60)}:
                        {String(Math.floor((sessionDuration * 60 * (100 - sessionProgress)) / 100 % 60)).padStart(2, '0')}
                      </div>
                      <Progress value={sessionProgress} className="w-full max-w-md mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        {Math.round(sessionProgress)}% complete
                      </p>
                    </div>
                    
                    <div className="flex gap-2 justify-center">
                      {isSessionActive ? (
                        <Button onClick={pauseSession} variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button onClick={resumeSession}>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      )}
                      <Button onClick={completeSession} variant="outline">
                        <SkipForward className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                      <Button onClick={simulateDistraction} variant="destructive" size="sm">
                        Simulate Distraction
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{distractionCount}</p>
                        <p className="text-sm text-muted-foreground">Distractions</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{energyLevel}%</p>
                        <p className="text-sm text-muted-foreground">Energy</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{flowState.isActive ? 'YES' : 'NO'}</p>
                        <p className="text-sm text-muted-foreground">Flow State</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Focus Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Focus Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{focusSessions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.round(focusSessions.reduce((acc, s) => acc + s.duration, 0) / 60)}h
                  </p>
                  <p className="text-sm text-muted-foreground">Total Focus Time</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.round((focusSessions.filter(s => s.flowStateAchieved).length / Math.max(focusSessions.length, 1)) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Flow State Rate</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.round(focusSessions.reduce((acc, s) => acc + s.distractionLevel, 0) / Math.max(focusSessions.length, 1))}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Distractions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="w-5 h-5" />
                  Soundscape Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ambientSoundEnabled ? (
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {soundscapeTypes.find(s => s.id === selectedSoundscape)?.icon}
                    </div>
                    <p className="font-medium mb-1">
                      {soundscapeTypes.find(s => s.id === selectedSoundscape)?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {soundscapeTypes.find(s => s.id === selectedSoundscape)?.description}
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <VolumeX className="w-4 h-4" />
                      <Slider
                        value={[soundscapeVolume]}
                        onValueChange={(value) => setSoundscapeVolume(value[0])}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Volume2 className="w-4 h-4" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{soundscapeVolume}% volume</p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Enable soundscape in session setup</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Focus Sessions</CardTitle>
              <CardDescription>Your latest productivity sessions with AI insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {focusSessions.slice(-5).reverse().map((session, index) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        workTypes.find(w => w.id === session.type)?.color
                      )} />
                      <div>
                        <p className="font-medium capitalize">{session.type.replace('-', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.duration} min • {session.distractionLevel} distractions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.flowStateAchieved && (
                        <Badge variant="secondary">
                          <Zap className="w-3 h-3 mr-1" />
                          Flow
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {session.energyLevel}%
                      </span>
                    </div>
                  </div>
                ))}
                
                {focusSessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No focus sessions yet. Start your first session above!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default FocusAssistantView;