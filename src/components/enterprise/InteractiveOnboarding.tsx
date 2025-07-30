import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { 
  PlayCircle,
  BookOpen,
  MessageCircle,
  Star,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp,
  Gift,
  Sparkles,
  Rocket
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

interface UserProgress {
  currentStep: number;
  completedSteps: string[];
  skippedSteps: string[];
  startedAt: Date;
  completedAt?: Date;
}

interface TutorialData {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  steps: number;
}

export function InteractiveOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useKV('onboarding-progress', {
    currentStep: 0,
    completedSteps: [],
    skippedSteps: [],
    startedAt: new Date()
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [userName, setUserName] = useState('');

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Cortex!',
      description: 'Let\'s get you set up with the most powerful productivity app',
      completed: false
    },
    {
      id: 'profile',
      title: 'Personalize Your Experience',
      description: 'Tell us a bit about yourself to customize your workspace',
      completed: false
    },
    {
      id: 'first-note',
      title: 'Create Your First Note',
      description: 'Experience our intelligent note-taking features',
      completed: false
    },
    {
      id: 'ai-assistant',
      title: 'Meet Your AI Assistant',
      description: 'Discover how AI can supercharge your productivity',
      completed: false
    },
    {
      id: 'organization',
      title: 'Organize Like a Pro',
      description: 'Learn about folders, tags, and smart categorization',
      completed: false
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Set up team features and sharing capabilities',
      completed: false,
      optional: true
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start building your knowledge base',
      completed: false
    }
  ];

  const tutorials: TutorialData[] = [
    {
      id: 'basic-notes',
      title: 'Creating and Formatting Notes',
      description: 'Learn the basics of note creation, formatting, and organization',
      duration: '5 min',
      difficulty: 'beginner',
      completed: false,
      steps: 8
    },
    {
      id: 'ai-features',
      title: 'AI-Powered Productivity',
      description: 'Master AI summarization, categorization, and smart suggestions',
      duration: '10 min',
      difficulty: 'intermediate',
      completed: false,
      steps: 12
    },
    {
      id: 'advanced-search',
      title: 'Advanced Search Techniques',
      description: 'Find anything instantly with powerful search filters and operators',
      duration: '7 min',
      difficulty: 'intermediate',
      completed: false,
      steps: 10
    },
    {
      id: 'team-workflow',
      title: 'Team Collaboration Workflow',
      description: 'Set up efficient team workflows and collaboration patterns',
      duration: '15 min',
      difficulty: 'advanced',
      completed: false,
      steps: 18
    }
  ];

  useEffect(() => {
    setCurrentStep(progress.currentStep || 0);
  }, [progress]);

  const completeStep = async (stepId: string) => {
    const newProgress = {
      ...progress,
      currentStep: Math.min(currentStep + 1, onboardingSteps.length - 1),
      completedSteps: [...progress.completedSteps, stepId]
    };

    if (newProgress.currentStep === onboardingSteps.length - 1) {
      newProgress.completedAt = new Date();
      toast.success('Onboarding completed!', {
        description: 'You\'re ready to start using Cortex like a pro!',
        duration: 5000
      });
    }

    await setProgress(newProgress);
    setCurrentStep(newProgress.currentStep);

    // Show celebration animation
    if (stepId !== 'complete') {
      createCelebrationEffect();
    }
  };

  const skipStep = async (stepId: string) => {
    const newProgress = {
      ...progress,
      currentStep: Math.min(currentStep + 1, onboardingSteps.length - 1),
      skippedSteps: [...progress.skippedSteps, stepId]
    };

    await setProgress(newProgress);
    setCurrentStep(newProgress.currentStep);
  };

  const createCelebrationEffect = () => {
    // Create particle effect for step completion
    const container = document.createElement('div');
    container.className = 'fixed inset-0 pointer-events-none z-50';
    document.body.appendChild(container);

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 0.5 + 's';
      container.appendChild(particle);
    }

    setTimeout(() => {
      document.body.removeChild(container);
    }, 2000);
  };

  const renderStep = () => {
    const step = onboardingSteps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mx-auto w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Cortex!</h2>
              <p className="text-muted-foreground text-lg">
                Your AI-powered productivity companion is ready to transform how you work
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/20 rounded-lg mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Smart Notes</h3>
                <p className="text-sm text-muted-foreground">AI-powered note taking</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-accent/20 rounded-lg mx-auto flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold">Task Management</h3>
                <p className="text-sm text-muted-foreground">Intelligent project planning</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg mx-auto flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">Track your productivity</p>
              </div>
            </div>

            <Button 
              onClick={() => completeStep('welcome')} 
              size="lg"
              className="px-8"
            >
              Let's Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        );

      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 p-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Personalize Your Experience</h2>
              <p className="text-muted-foreground">
                Help us customize Cortex for your specific needs
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>What's your primary use case?</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {['Personal Notes', 'Team Collaboration', 'Project Management', 'Research & Writing'].map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      className="justify-start"
                      onClick={() => {}}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => skipStep('profile')}
              >
                Skip for now
              </Button>
              <Button 
                onClick={() => completeStep('profile')}
                disabled={!userName.trim()}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        );

      case 'first-note':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 p-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Create Your First Note</h2>
              <p className="text-muted-foreground">
                Experience our intelligent note-taking features
              </p>
            </div>

            <div className="relative">
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">Click here to create your first note</h3>
                <p className="text-sm text-muted-foreground">
                  Try typing something like "Meeting notes for project planning"
                </p>
              </div>

              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
                >
                  Great! Notice how AI suggests tags automatically
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
                </motion.div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => skipStep('first-note')}
              >
                Skip for now
              </Button>
              <Button 
                onClick={() => completeStep('first-note')}
              >
                I created a note
              </Button>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6 p-8"
          >
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <p className="text-muted-foreground">{step.description}</p>
            
            <div className="flex gap-2 justify-center">
              {step.optional && (
                <Button 
                  variant="outline" 
                  onClick={() => skipStep(step.id)}
                >
                  Skip
                </Button>
              )}
              <Button onClick={() => completeStep(step.id)}>
                {step.id === 'complete' ? 'Start Using Cortex' : 'Continue'}
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  const progressPercentage = (currentStep / (onboardingSteps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <Badge variant="outline">{Math.round(progressPercentage)}% Complete</Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-2 mb-2" />
          
          <div className="flex justify-center gap-2 mt-4">
            {onboardingSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index < currentStep ? "bg-primary" : 
                  index === currentStep ? "bg-primary/60" : "bg-muted"
                )}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <Card className="glass-elevated">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Tutorial Links */}
        {currentStep === onboardingSteps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold text-center mb-4">
              Continue Learning with Interactive Tutorials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="glass-card hover:glass-elevated transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-primary" />
                        <span className="font-medium">{tutorial.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tutorial.duration}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {tutorial.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {tutorial.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tutorial.steps} steps
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}