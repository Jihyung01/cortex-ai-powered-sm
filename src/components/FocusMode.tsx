import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Timer, 
  Play, 
  Pause, 
  X, 
  CheckSquare, 
  Coffee, 
  Target,
  SkipForward,
  Settings,
  Volume2,
  VolumeX
} from '@phosphor-icons/react';
import { useTasks } from '@/hooks/use-tasks';
import { useAppState } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export function FocusMode() {
  const { 
    tasks, 
    getTask, 
    updateTask, 
    completeTask,
    startPomodoroSession 
  } = useTasks();
  
  const { 
    focusMode, 
    setFocusMode, 
    activePomodoroSession, 
    setActivePomodoroSession,
    selectedTaskId,
    setSelectedTaskId
  } = useAppState();

  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    autoStartBreaks: false,
    autoStartPomodoros: false
  });

  const currentTask = selectedTaskId ? getTask(selectedTaskId) : null;

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('cortex-pomodoro-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        // Use default settings
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('cortex-pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Initialize timer when session type changes
  useEffect(() => {
    switch (currentSession) {
      case 'work':
        setTimeLeft(settings.workDuration * 60);
        break;
      case 'short-break':
        setTimeLeft(settings.shortBreakDuration * 60);
        break;
      case 'long-break':
        setTimeLeft(settings.longBreakDuration * 60);
        break;
    }
  }, [currentSession, settings]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    
    // Play sound if enabled
    if (settings.soundEnabled) {
      // In a real app, you'd play an actual sound file
      toast.success('Session completed! 🎉');
    }

    if (currentSession === 'work') {
      // Work session completed
      const newSessionCount = sessionsCompleted + 1;
      setSessionsCompleted(newSessionCount);
      
      // Record the pomodoro session
      if (currentTask) {
        startPomodoroSession(currentTask.id, settings.workDuration);
        updateTask(currentTask.id, { 
          pomodoroSessions: currentTask.pomodoroSessions + 1 
        });
      }
      
      // Determine next break type
      const isLongBreak = newSessionCount % settings.sessionsUntilLongBreak === 0;
      setCurrentSession(isLongBreak ? 'long-break' : 'short-break');
      
      toast.success(`Work session complete! Time for a ${isLongBreak ? 'long' : 'short'} break.`);
      
      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    } else {
      // Break completed
      setCurrentSession('work');
      toast.success('Break over! Ready for another work session?');
      
      // Auto-start pomodoro if enabled
      if (settings.autoStartPomodoros) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    }
  }, [currentSession, sessionsCompleted, settings, currentTask, startPomodoroSession, updateTask]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    switch (currentSession) {
      case 'work':
        setTimeLeft(settings.workDuration * 60);
        break;
      case 'short-break':
        setTimeLeft(settings.shortBreakDuration * 60);
        break;
      case 'long-break':
        setTimeLeft(settings.longBreakDuration * 60);
        break;
    }
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const exitFocusMode = () => {
    setIsRunning(false);
    setFocusMode(false);
    setActivePomodoroSession(undefined);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'work':
        return <Target size={24} />;
      case 'short-break':
      case 'long-break':
        return <Coffee size={24} />;
    }
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work':
        return 'bg-red-500';
      case 'short-break':
        return 'bg-blue-500';
      case 'long-break':
        return 'bg-green-500';
    }
  };

  const getSessionTitle = () => {
    switch (currentSession) {
      case 'work':
        return 'Focus Session';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
    }
  };

  const totalDuration = (() => {
    switch (currentSession) {
      case 'work':
        return settings.workDuration * 60;
      case 'short-break':
        return settings.shortBreakDuration * 60;
      case 'long-break':
        return settings.longBreakDuration * 60;
    }
  })();

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-2xl mx-auto p-8">
        {/* Exit Button */}
        <div className="flex justify-end mb-8">
          <Button variant="ghost" size="icon" onClick={exitFocusMode}>
            <X size={20} />
          </Button>
        </div>

        {/* Main Timer Card */}
        <Card className="glass-card border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getSessionIcon()}
              <CardTitle className="text-2xl">{getSessionTitle()}</CardTitle>
            </div>
            
            {currentTask && (
              <div className="flex items-center justify-center gap-2">
                <CheckSquare size={16} />
                <span className="text-muted-foreground">{currentTask.title}</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="text-center space-y-8">
            {/* Timer Display */}
            <div className="space-y-4">
              <div className="text-8xl font-mono font-bold text-foreground">
                {formatTime(timeLeft)}
              </div>
              
              {/* Progress Ring */}
              <div className="relative w-64 h-64 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted/20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 2.827} 282.7`}
                    className={cn(
                      "transition-all duration-1000 ease-linear",
                      currentSession === 'work' && "text-red-500",
                      currentSession === 'short-break' && "text-blue-500",
                      currentSession === 'long-break' && "text-green-500"
                    )}
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">
                      Session {sessionsCompleted + 1}
                    </div>
                    <Badge variant="outline" className={cn("text-white", getSessionColor())}>
                      {Math.round(progress)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                disabled={isRunning}
              >
                <Timer size={20} />
              </Button>

              <Button
                size="lg"
                onClick={toggleTimer}
                className={cn(
                  "w-20 h-20 rounded-full",
                  getSessionColor(),
                  "hover:opacity-90"
                )}
              >
                {isRunning ? <Pause size={32} /> : <Play size={32} />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={skipSession}
              >
                <SkipForward size={20} />
              </Button>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {sessionsCompleted}
                </div>
                <div className="text-sm text-muted-foreground">
                  Completed
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {currentTask?.pomodoroSessions || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Task Sessions
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {Math.ceil(sessionsCompleted / settings.sessionsUntilLongBreak)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Cycles
                </div>
              </div>
            </div>

            {/* Settings Toggle */}
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={16} />
                <span className="ml-2">Settings</span>
              </Button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <Card className="mt-4 p-4 bg-muted/50">
                <div className="space-y-4">
                  <h3 className="font-semibold text-center">Pomodoro Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Work Duration (min)</label>
                      <input
                        type="number"
                        value={settings.workDuration}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          workDuration: parseInt(e.target.value) || 25 
                        }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="1"
                        max="60"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Short Break (min)</label>
                      <input
                        type="number"
                        value={settings.shortBreakDuration}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          shortBreakDuration: parseInt(e.target.value) || 5 
                        }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="1"
                        max="30"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Long Break (min)</label>
                      <input
                        type="number"
                        value={settings.longBreakDuration}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          longBreakDuration: parseInt(e.target.value) || 15 
                        }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="1"
                        max="60"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Sessions until Long Break</label>
                      <input
                        type="number"
                        value={settings.sessionsUntilLongBreak}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          sessionsUntilLongBreak: parseInt(e.target.value) || 4 
                        }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="2"
                        max="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          soundEnabled: e.target.checked 
                        }))}
                      />
                      <span className="text-sm">Enable sound notifications</span>
                      {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.autoStartBreaks}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          autoStartBreaks: e.target.checked 
                        }))}
                      />
                      <span className="text-sm">Auto-start breaks</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.autoStartPomodoros}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          autoStartPomodoros: e.target.checked 
                        }))}
                      />
                      <span className="text-sm">Auto-start work sessions</span>
                    </label>
                  </div>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Task Selection */}
        {!currentTask && (
          <Card className="mt-4 p-4 bg-muted/50">
            <div className="text-center">
              <h3 className="font-semibold mb-2">No task selected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a task to track time for this session
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {tasks.filter(task => task.status !== 'done').slice(0, 5).map(task => (
                  <Button
                    key={task.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <CheckSquare size={16} />
                    <span className="ml-2 truncate">{task.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}