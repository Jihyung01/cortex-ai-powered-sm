import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKV } from '@github/spark/hooks';
import { 
  CubeTransparent,
  Microphone,
  MicrophoneSlash,
  Eye,
  Camera,
  Gamepad2,
  Trophy,
  Star,
  Zap,
  Brain,
  Rocket,
  Target,
  Clock,
  TrendUp,
  Users,
  Globe,
  Settings,
  Play,
  Pause,
  VolumeUp,
  VolumeOff,
  Monitor,
  Smartphone
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ARWorkspace {
  id: string;
  name: string;
  layout: '3d-canvas' | 'spatial-notes' | 'task-sphere' | 'timeline-tunnel';
  objects: ARObject[];
  isActive: boolean;
  lastUsed: Date;
}

interface ARObject {
  id: string;
  type: 'note' | 'task' | 'project' | 'reminder' | 'visualization';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  content: any;
  color: string;
  opacity: number;
}

interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  confidence: number;
  timestamp: Date;
  parameters?: Record<string, any>;
}

interface BiometricReading {
  id: string;
  type: 'heart_rate' | 'stress' | 'focus' | 'fatigue' | 'engagement';
  value: number;
  timestamp: Date;
  context: string;
}

interface GameElement {
  id: string;
  type: 'achievement' | 'badge' | 'level' | 'streak' | 'challenge';
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: 'productivity' | 'wellness' | 'collaboration' | 'learning';
  reward: string;
}

interface PredictiveText {
  suggestions: string[];
  confidence: number;
  context: string;
  learnedPatterns: string[];
}

const arLayouts = [
  {
    id: '3d-canvas',
    name: '3D Canvas',
    description: 'Spatial task management in 3D space',
    icon: CubeTransparent,
    complexity: 'Advanced'
  },
  {
    id: 'spatial-notes',
    name: 'Spatial Notes',
    description: 'Notes floating in virtual space',
    icon: Eye,
    complexity: 'Medium'
  },
  {
    id: 'task-sphere',
    name: 'Task Sphere',
    description: 'Tasks arranged in spherical clusters',
    icon: Target,
    complexity: 'Advanced'
  },
  {
    id: 'timeline-tunnel',
    name: 'Timeline Tunnel',
    description: 'Navigate through time in tunnel view',
    icon: Clock,
    complexity: 'Expert'
  }
];

const voiceCommands = [
  { phrase: "Create a new note", action: "createNote" },
  { phrase: "Show my tasks", action: "showTasks" },
  { phrase: "Schedule a meeting", action: "scheduleMeeting" },
  { phrase: "Start focus mode", action: "startFocus" },
  { phrase: "Take a break", action: "takeBreak" },
  { phrase: "Open analytics", action: "openAnalytics" },
  { phrase: "Switch to project view", action: "switchView" },
  { phrase: "Set reminder for", action: "setReminder" }
];

const achievements = [
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Complete 10 deep focus sessions',
    category: 'productivity',
    icon: Brain,
    color: 'bg-blue-500'
  },
  {
    id: 'wellness-warrior',
    title: 'Wellness Warrior',
    description: 'Complete wellness check-ins for 7 days',
    category: 'wellness',
    icon: Zap,
    color: 'bg-green-500'
  },
  {
    id: 'collaboration-champion',
    title: 'Collaboration Champion',
    description: 'Complete 5 team projects',
    category: 'collaboration',
    icon: Users,
    color: 'bg-purple-500'
  },
  {
    id: 'innovation-icon',
    title: 'Innovation Icon',
    description: 'Use 3 advanced features in one day',
    category: 'learning',
    icon: Rocket,
    color: 'bg-orange-500'
  }
];

export function FutureTechView() {
  const [arWorkspaces, setArWorkspaces] = useKV<ARWorkspace[]>('ar-workspaces', []);
  const [voiceCommandHistory, setVoiceCommandHistory] = useKV<VoiceCommand[]>('voice-commands', []);
  const [biometricReadings, setBiometricReadings] = useKV<BiometricReading[]>('biometric-readings', []);
  const [gameElements, setGameElements] = useKV<GameElement[]>('game-elements', []);
  
  // State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [arEnabled, setArEnabled] = useState<boolean>(false);
  const [selectedArLayout, setSelectedArLayout] = useState<string>('3d-canvas');
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(false);
  const [gamificationEnabled, setGamificationEnabled] = useState<boolean>(true);
  const [currentLevel, setCurrentLevel] = useState<number>(12);
  const [experiencePoints, setExperiencePoints] = useState<number>(2847);
  const [activeStreak, setActiveStreak] = useState<number>(7);
  
  // Predictive text
  const [predictiveText, setPredictiveText] = useState<PredictiveText>({
    suggestions: [],
    confidence: 0,
    context: '',
    learnedPatterns: []
  });
  
  // Simulated biometrics
  const [simulatedBiometrics, setSimulatedBiometrics] = useState({
    heartRate: 72,
    stressLevel: 25,
    focusLevel: 85,
    engagement: 78
  });

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          handleVoiceCommand(lastResult[0].transcript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Initialize sample data
  useEffect(() => {
    if (gameElements.length === 0) {
      const sampleAchievements: GameElement[] = achievements.map((achievement, index) => ({
        id: achievement.id,
        type: 'achievement',
        title: achievement.title,
        description: achievement.description,
        progress: Math.random() * 10,
        maxProgress: 10,
        unlocked: index < 2,
        category: achievement.category as any,
        reward: `+${(index + 1) * 100} XP`
      }));
      setGameElements(sampleAchievements);
    }

    if (arWorkspaces.length === 0) {
      const sampleWorkspace: ARWorkspace = {
        id: 'workspace-1',
        name: 'Main Productivity Space',
        layout: '3d-canvas',
        objects: [
          {
            id: 'obj-1',
            type: 'task',
            position: { x: 0, y: 1, z: -2 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            content: { title: 'Complete AI Integration', priority: 'high' },
            color: '#3B82F6',
            opacity: 0.8
          }
        ],
        isActive: false,
        lastUsed: new Date()
      };
      setArWorkspaces([sampleWorkspace]);
    }
  }, [gameElements.length, arWorkspaces.length, setGameElements, setArWorkspaces]);

  // Simulate biometric readings
  useEffect(() => {
    const interval = setInterval(() => {
      if (biometricsEnabled) {
        setSimulatedBiometrics(prev => ({
          heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4)),
          stressLevel: Math.max(0, Math.min(100, prev.stressLevel + (Math.random() - 0.5) * 10)),
          focusLevel: Math.max(0, Math.min(100, prev.focusLevel + (Math.random() - 0.5) * 8)),
          engagement: Math.max(0, Math.min(100, prev.engagement + (Math.random() - 0.5) * 6))
        }));

        // Log biometric reading
        const reading: BiometricReading = {
          id: `reading-${Date.now()}`,
          type: 'focus',
          value: simulatedBiometrics.focusLevel,
          timestamp: new Date(),
          context: 'Continuous monitoring'
        };
        setBiometricReadings(prev => [...prev.slice(-50), reading]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [biometricsEnabled, simulatedBiometrics, setBiometricReadings]);

  const handleVoiceCommand = useCallback(async (transcript: string) => {
    const command = voiceCommands.find(cmd => 
      transcript.toLowerCase().includes(cmd.phrase.toLowerCase())
    );
    
    if (command) {
      const voiceCommand: VoiceCommand = {
        id: `cmd-${Date.now()}`,
        phrase: transcript,
        action: command.action,
        confidence: 0.9,
        timestamp: new Date()
      };
      
      setVoiceCommandHistory(prev => [...prev, voiceCommand]);
      
      // Execute command with AI interpretation
      try {
        const prompt = spark.llmPrompt`Voice command: "${transcript}". Extract intent and parameters for action: ${command.action}. Return as JSON with action and parameters.`;
        const response = await spark.llm(prompt, 'gpt-4o-mini', true);
        const parsed = JSON.parse(response);
        
        toast.success(`🎤 Voice command executed: ${command.action}`, {
          description: `"${transcript}"`
        });
        
        // Award XP for voice usage
        if (gamificationEnabled) {
          setExperiencePoints(prev => prev + 25);
          toast.success('+25 XP - Voice Command Master!');
        }
      } catch (error) {
        console.error('Failed to process voice command:', error);
        toast.error('Failed to process voice command');
      }
    } else {
      toast.warning('Voice command not recognized');
    }
  }, [setVoiceCommandHistory, gamificationEnabled]);

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('🎤 Listening for voice commands...');
    }
  };

  const toggleARMode = () => {
    setArEnabled(prev => {
      const newState = !prev;
      if (newState) {
        toast.success('🥽 AR Mode activated!', {
          description: 'Your workspace is now in 3D space'
        });
        if (gamificationEnabled) {
          setExperiencePoints(prev => prev + 50);
          toast.success('+50 XP - Future Tech Explorer!');
        }
      } else {
        toast.info('AR Mode deactivated');
      }
      return newState;
    });
  };

  const generatePredictiveText = useCallback(async (context: string) => {
    try {
      const prompt = spark.llmPrompt`Based on context: "${context}" and user's productivity patterns, suggest 3 text completions that would help with task creation, note-taking, or scheduling. Return as simple array of strings.`;
      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const suggestions = JSON.parse(response);
      
      setPredictiveText({
        suggestions: suggestions.slice(0, 3),
        confidence: 0.85,
        context,
        learnedPatterns: ['meeting notes', 'task creation', 'project planning']
      });
    } catch (error) {
      console.error('Failed to generate predictive text:', error);
    }
  }, []);

  const completeAchievement = (achievementId: string) => {
    setGameElements(prev => prev.map(element => 
      element.id === achievementId 
        ? { ...element, progress: element.maxProgress, unlocked: true }
        : element
    ));
    
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      setExperiencePoints(prev => prev + 200);
      toast.success(`🏆 Achievement Unlocked: ${achievement.title}!`, {
        description: '+200 XP earned'
      });
    }
  };

  const simulateScreenShare = () => {
    toast.info('📺 Screen sharing simulation started', {
      description: 'Sharing productivity workspace with team'
    });
    
    setTimeout(() => {
      toast.success('✅ Screen sharing completed');
      if (gamificationEnabled) {
        setExperiencePoints(prev => prev + 30);
        toast.success('+30 XP - Collaboration Master!');
      }
    }, 3000);
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="w-8 h-8 text-purple-600" weight="duotone" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Future-Ready Technologies
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Next-generation productivity features with AR, voice control, biometrics, and gamification
          </p>
        </motion.div>

        {/* Gamification Status Bar */}
        <AnimatePresence>
          {gamificationEnabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-auto max-w-4xl"
            >
              <Card className="glass-elevated border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" weight="duotone" />
                        <span className="font-semibold">Level {currentLevel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-500" weight="duotone" />
                        <span className="text-sm">{experiencePoints.toLocaleString()} XP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-500" weight="duotone" />
                        <span className="text-sm">{activeStreak} day streak</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Next Level</p>
                      <Progress value={75} className="w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tech Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Advanced Technology Suite
                </CardTitle>
                <CardDescription>
                  Cutting-edge features for next-level productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ar" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="ar">AR Workspace</TabsTrigger>
                    <TabsTrigger value="voice">Voice Control</TabsTrigger>
                    <TabsTrigger value="biometrics">Biometrics</TabsTrigger>
                    <TabsTrigger value="predictive">AI Text</TabsTrigger>
                    <TabsTrigger value="gamification">Gamification</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ar" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Augmented Reality Workspace</h4>
                        <p className="text-sm text-muted-foreground">Spatial task management in 3D</p>
                      </div>
                      <Switch checked={arEnabled} onCheckedChange={toggleARMode} />
                    </div>
                    
                    {arEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-sm font-medium mb-2 block">AR Layout</label>
                          <div className="grid grid-cols-2 gap-3">
                            {arLayouts.map(layout => {
                              const Icon = layout.icon;
                              return (
                                <button
                                  key={layout.id}
                                  onClick={() => setSelectedArLayout(layout.id)}
                                  className={cn(
                                    "p-3 rounded-lg border text-left transition-all",
                                    selectedArLayout === layout.id
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <Icon className="w-5 h-5 mb-2 text-primary" weight="duotone" />
                                  <p className="font-medium text-sm">{layout.name}</p>
                                  <p className="text-xs text-muted-foreground">{layout.description}</p>
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {layout.complexity}
                                  </Badge>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <CubeTransparent className="w-6 h-6 text-blue-600" weight="duotone" />
                            <h5 className="font-semibold">AR Preview</h5>
                          </div>
                          <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded border-2 border-dashed border-blue-300 flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">3D Workspace Simulation</p>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Badge variant="secondary">
                              <Eye className="w-3 h-3 mr-1" />
                              Eye Tracking
                            </Badge>
                            <Badge variant="secondary">
                              <Target className="w-3 h-3 mr-1" />
                              Gesture Control
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="voice" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Advanced Voice Interface</h4>
                        <p className="text-sm text-muted-foreground">Natural language productivity control</p>
                      </div>
                      <Switch checked={isVoiceEnabled} onCheckedChange={setIsVoiceEnabled} />
                    </div>
                    
                    {isVoiceEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div className="text-center">
                          <Button
                            onClick={toggleVoiceRecognition}
                            size="lg"
                            variant={isListening ? "destructive" : "default"}
                            className="mb-4"
                          >
                            {isListening ? (
                              <>
                                <MicrophoneSlash className="w-5 h-5 mr-2" />
                                Stop Listening
                              </>
                            ) : (
                              <>
                                <Microphone className="w-5 h-5 mr-2" />
                                Start Voice Control
                              </>
                            )}
                          </Button>
                          
                          {isListening && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center justify-center gap-2 mb-4"
                            >
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-sm text-red-600">Listening...</span>
                            </motion.div>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">Available Commands</h5>
                          <div className="grid grid-cols-1 gap-2">
                            {voiceCommands.slice(0, 4).map((cmd, index) => (
                              <div key={index} className="p-2 bg-muted rounded text-sm">
                                <span className="font-mono">"{cmd.phrase}"</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">Recent Commands</h5>
                          <ScrollArea className="h-24">
                            {voiceCommandHistory.slice(-3).map(cmd => (
                              <div key={cmd.id} className="p-2 border-b text-sm">
                                <p className="font-medium">{cmd.phrase}</p>
                                <p className="text-xs text-muted-foreground">
                                  {cmd.action} • {Math.round(cmd.confidence * 100)}% confidence
                                </p>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="biometrics" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Biometric Integration</h4>
                        <p className="text-sm text-muted-foreground">Real-time health and focus monitoring</p>
                      </div>
                      <Switch checked={biometricsEnabled} onCheckedChange={setBiometricsEnabled} />
                    </div>
                    
                    {biometricsEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Heart Rate</p>
                            <p className="text-2xl font-bold text-red-600">
                              {Math.round(simulatedBiometrics.heartRate)}
                            </p>
                            <p className="text-xs">BPM</p>
                          </div>
                          
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Stress</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {Math.round(simulatedBiometrics.stressLevel)}%
                            </p>
                            <p className="text-xs">Level</p>
                          </div>
                          
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Focus</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {Math.round(simulatedBiometrics.focusLevel)}%
                            </p>
                            <p className="text-xs">Score</p>
                          </div>
                          
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Engagement</p>
                            <p className="text-2xl font-bold text-green-600">
                              {Math.round(simulatedBiometrics.engagement)}%
                            </p>
                            <p className="text-xs">Level</p>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h6 className="font-semibold mb-2">AI Optimization Suggestions</h6>
                          <div className="space-y-1 text-sm">
                            <p>• Your focus peaks at 10 AM - schedule complex tasks then</p>
                            <p>• Stress levels rising - consider a 5-minute break</p>
                            <p>• Heart rate variability suggests good recovery</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="predictive" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Predictive Text & AI Assistance</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Advanced pattern recognition for intelligent text completion
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <Button
                        onClick={() => generatePredictiveText("meeting notes")}
                        className="w-full"
                        variant="outline"
                      >
                        Generate Smart Suggestions
                      </Button>
                      
                      {predictiveText.suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <h6 className="font-semibold">AI Suggestions ({Math.round(predictiveText.confidence * 100)}% confidence)</h6>
                          {predictiveText.suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                            >
                              <p className="text-sm">{suggestion}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                      
                      <div className="p-3 bg-muted rounded-lg">
                        <h6 className="font-semibold mb-2">Learned Patterns</h6>
                        <div className="flex flex-wrap gap-2">
                          {['Quick notes', 'Task creation', 'Meeting prep', 'Project planning'].map(pattern => (
                            <Badge key={pattern} variant="secondary">{pattern}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="gamification" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Productivity Gamification</h4>
                        <p className="text-sm text-muted-foreground">Achieve goals and unlock rewards</p>
                      </div>
                      <Switch checked={gamificationEnabled} onCheckedChange={setGamificationEnabled} />
                    </div>
                    
                    {gamificationEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div>
                          <h5 className="font-semibold mb-3">Achievements</h5>
                          <div className="space-y-3">
                            {gameElements.filter(e => e.type === 'achievement').map(achievement => {
                              const achievementData = achievements.find(a => a.id === achievement.id);
                              const Icon = achievementData?.icon || Trophy;
                              const isComplete = achievement.progress >= achievement.maxProgress;
                              
                              return (
                                <motion.div
                                  key={achievement.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={cn(
                                    "p-3 border rounded-lg",
                                    isComplete ? "bg-green-50 dark:bg-green-900/20 border-green-200" : "hover:bg-accent/50"
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={cn(
                                      "w-10 h-10 rounded-lg flex items-center justify-center",
                                      achievementData?.color || "bg-gray-500"
                                    )}>
                                      <Icon className="w-5 h-5 text-white" weight="duotone" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <h6 className="font-semibold">{achievement.title}</h6>
                                        {isComplete && <Badge variant="secondary">Completed!</Badge>}
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                                      <div className="flex items-center justify-between">
                                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="flex-1 mr-3" />
                                        <span className="text-xs text-muted-foreground">
                                          {Math.round(achievement.progress)}/{achievement.maxProgress}
                                        </span>
                                      </div>
                                      {!isComplete && (
                                        <Button
                                          onClick={() => completeAchievement(achievement.id)}
                                          size="sm"
                                          variant="outline"
                                          className="mt-2"
                                        >
                                          Simulate Complete
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Tech Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CubeTransparent className="w-4 h-4" />
                      <span className="text-sm">AR Mode</span>
                    </div>
                    <Switch checked={arEnabled} onCheckedChange={toggleARMode} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Microphone className="w-4 h-4" />
                      <span className="text-sm">Voice Control</span>
                    </div>
                    <Switch checked={isVoiceEnabled} onCheckedChange={setIsVoiceEnabled} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Biometrics</span>
                    </div>
                    <Switch checked={biometricsEnabled} onCheckedChange={setBiometricsEnabled} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" />
                      <span className="text-sm">Gamification</span>
                    </div>
                    <Switch checked={gamificationEnabled} onCheckedChange={setGamificationEnabled} />
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <Button onClick={simulateScreenShare} className="w-full" variant="outline">
                    <Monitor className="w-4 h-4 mr-2" />
                    Share Screen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp className="w-5 h-5" />
                  Tech Usage Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{voiceCommandHistory.length}</p>
                  <p className="text-sm text-muted-foreground">Voice Commands</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">{biometricReadings.length}</p>
                  <p className="text-sm text-muted-foreground">Biometric Readings</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">{arWorkspaces.length}</p>
                  <p className="text-sm text-muted-foreground">AR Workspaces</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {gameElements.filter(e => e.unlocked).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}