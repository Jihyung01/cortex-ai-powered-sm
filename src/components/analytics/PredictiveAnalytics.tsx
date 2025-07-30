import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChartBarIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { cn } from '@/lib/utils';
import { springPresets } from '@/hooks/use-motion';

interface PredictiveAnalyticsProps {
  data: any;
  timeRange: string;
}

interface Prediction {
  id: string;
  type: 'completion' | 'performance' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  factors: string[];
  recommendations: string[];
  data?: any;
}

interface MachineLearningModel {
  name: string;
  accuracy: number;
  lastTrained: string;
  dataPoints: number;
  features: string[];
}

export function PredictiveAnalytics({ data, timeRange }: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [models, setModels] = useState<MachineLearningModel[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate predictive forecasts
  const forecastData = useMemo(() => {
    const historical = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual: Math.floor(Math.random() * 20) + 70,
      type: 'historical'
    }));

    const predicted = Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predicted: Math.floor(Math.random() * 15) + 75,
      confidenceUpper: Math.floor(Math.random() * 10) + 85,
      confidenceLower: Math.floor(Math.random() * 10) + 65,
      type: 'predicted'
    }));

    return [...historical, ...predicted];
  }, []);

  // Goal completion probability data
  const goalProbabilities = useMemo(() => {
    return [
      {
        goal: 'Complete Project Alpha',
        currentProgress: 75,
        targetDate: '2024-12-31',
        probability: 87,
        trend: 'increasing',
        factors: ['On-time task completion', 'Team collaboration', 'Resource availability']
      },
      {
        goal: 'Learn New Technology',
        currentProgress: 45,
        targetDate: '2024-11-30',
        probability: 72,
        trend: 'stable',
        factors: ['Learning pace', 'Available study time', 'Practical application']
      },
      {
        goal: 'Improve Team Efficiency',
        currentProgress: 60,
        targetDate: '2024-10-31',
        probability: 93,
        trend: 'increasing',
        factors: ['Process improvements', 'Tool adoption', 'Communication quality']
      }
    ];
  }, []);

  // Generate ML-based predictions
  useEffect(() => {
    const generatePredictions = async () => {
      setIsAnalyzing(true);
      
      // Simulate ML analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPredictions: Prediction[] = [
        {
          id: '1',
          type: 'completion',
          title: 'Project Alpha Completion Forecast',
          description: 'Based on current velocity and remaining scope, Project Alpha has an 87% probability of completion by December 31st.',
          confidence: 87,
          timeframe: '45 days',
          probability: 87,
          impact: 'high',
          factors: [
            'Current sprint velocity: 23 story points',
            'Remaining scope: 89 story points',
            'Team stability: High',
            'Blocker frequency: Low'
          ],
          recommendations: [
            'Maintain current team composition',
            'Pre-emptively identify potential blockers',
            'Consider scope reduction for 13% buffer'
          ],
          data: goalProbabilities[0]
        },
        {
          id: '2',
          type: 'performance',
          title: 'Productivity Peak Prediction',
          description: 'ML models predict a 15% productivity increase in the next 2 weeks due to seasonal patterns and workflow optimizations.',
          confidence: 78,
          timeframe: '14 days',
          probability: 78,
          impact: 'medium',
          factors: [
            'Historical seasonal trends',
            'Recent workflow improvements',
            'Team expertise growth',
            'Reduced context switching'
          ],
          recommendations: [
            'Schedule complex tasks during predicted peak',
            'Minimize meetings during high-productivity periods',
            'Prepare challenging projects for increased capacity'
          ]
        },
        {
          id: '3',
          type: 'risk',
          title: 'Burnout Risk Assessment',
          description: 'Early warning system detects 34% probability of team burnout risk in the next month without intervention.',
          confidence: 82,
          timeframe: '30 days',
          probability: 34,
          impact: 'high',
          factors: [
            'Increasing work hours trend',
            'Declining break frequency',
            'Rising task complexity',
            'Reduced social interactions'
          ],
          recommendations: [
            'Implement mandatory break reminders',
            'Redistribute high-complexity tasks',
            'Schedule team building activities',
            'Monitor workload distribution weekly'
          ]
        },
        {
          id: '4',
          type: 'opportunity',
          title: 'Skill Development Window',
          description: 'Optimal learning period identified with 91% success probability for new technology adoption.',
          confidence: 91,
          timeframe: '3 weeks',
          probability: 91,
          impact: 'medium',
          factors: [
            'Low project pressure period',
            'High cognitive availability',
            'Peer support availability',
            'Training resource access'
          ],
          recommendations: [
            'Enroll in advanced courses immediately',
            'Form study groups with colleagues',
            'Apply learning to side projects',
            'Schedule knowledge sharing sessions'
          ]
        }
      ];
      
      setPredictions(mockPredictions);
      setIsAnalyzing(false);
    };

    const generateModels = () => {
      const mockModels: MachineLearningModel[] = [
        {
          name: 'Productivity Forecasting Model',
          accuracy: 84.2,
          lastTrained: '2024-01-15',
          dataPoints: 2847,
          features: ['Task completion rate', 'Focus hours', 'Meeting frequency', 'Break patterns']
        },
        {
          name: 'Burnout Risk Predictor',
          accuracy: 78.9,
          lastTrained: '2024-01-14',
          dataPoints: 1923,
          features: ['Work hours', 'Stress indicators', 'Communication patterns', 'Task complexity']
        },
        {
          name: 'Goal Achievement Estimator',
          accuracy: 91.3,
          lastTrained: '2024-01-16',
          dataPoints: 1456,
          features: ['Progress velocity', 'Resource availability', 'Scope changes', 'Team dynamics']
        }
      ];
      
      setModels(mockModels);
    };

    generatePredictions();
    generateModels();
  }, [data, timeRange]);

  const getPredictionIcon = (type: Prediction['type']) => {
    switch (type) {
      case 'completion': return CheckCircleIcon;
      case 'performance': return ArrowTrendingUpIcon;
      case 'risk': return ExclamationTriangleIcon;
      case 'opportunity': return SparklesIcon;
      default: return ChartBarIcon;
    }
  };

  const getPredictionColor = (type: Prediction['type']) => {
    switch (type) {
      case 'completion': return 'text-green-500';
      case 'performance': return 'text-blue-500';
      case 'risk': return 'text-red-500';
      case 'opportunity': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getBadgeVariant = (type: Prediction['type']) => {
    switch (type) {
      case 'completion': return 'default';
      case 'performance': return 'secondary';
      case 'risk': return 'destructive';
      case 'opportunity': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                <BeakerIcon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Predictive Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-powered forecasting and machine learning insights
                </p>
              </div>
            </div>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Analyzing patterns...
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productivity Forecast Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-500" />
                Productivity Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 240)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="oklch(0.45 0.02 270)"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="oklch(0.45 0.02 270)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confidenceUpper" 
                    stroke="transparent" 
                    fill="#8b5cf6" 
                    fillOpacity={0.1}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confidenceLower" 
                    stroke="transparent" 
                    fill="#ffffff" 
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                  <span>Historical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-sm opacity-60" />
                  <span>Predicted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-300 rounded-sm opacity-30" />
                  <span>Confidence Interval</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Completion Probabilities */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-green-500" />
                Goal Achievement Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goalProbabilities.map((goal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, ...springPresets.gentle }}
                  className="p-4 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{goal.goal}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Due: {new Date(goal.targetDate).toLocaleDateString()}
                      </Badge>
                      <Badge 
                        variant={goal.probability > 80 ? 'default' : goal.probability > 60 ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {goal.probability}% likely
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.currentProgress}%</span>
                    </div>
                    <Progress value={goal.currentProgress} className="h-2" />
                  </div>
                  
                  <div className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium">Key Factors: </span>
                    {goal.factors.slice(0, 2).join(', ')}
                    {goal.factors.length > 2 && ` +${goal.factors.length - 2} more`}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Predictions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Predictions</h3>
            {predictions.map((prediction, index) => {
              const IconComponent = getPredictionIcon(prediction.type);
              
              return (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, ...springPresets.gentle }}
                >
                  <Card 
                    className={cn(
                      "glass-card hover:glass-elevated transition-all duration-300 cursor-pointer",
                      selectedPrediction?.id === prediction.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedPrediction(prediction)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5", getPredictionColor(prediction.type))}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{prediction.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant(prediction.type)} className="text-xs">
                                {prediction.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {prediction.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {prediction.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {prediction.timeframe}
                            </div>
                            <div className="flex items-center gap-1">
                              {prediction.probability > 70 ? 
                                <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" /> :
                                <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
                              }
                              {prediction.probability}% probability
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Prediction Details */}
          {selectedPrediction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springPresets.gentle}
            >
              <Card className="glass-elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Prediction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{selectedPrediction.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedPrediction.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Confidence</span>
                        <span className="font-medium">{selectedPrediction.confidence}%</span>
                      </div>
                      <Progress value={selectedPrediction.confidence} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Probability</span>
                        <span className="font-medium">{selectedPrediction.probability}%</span>
                      </div>
                      <Progress value={selectedPrediction.probability} className="h-2" />
                    </div>
                  </div>

                  {selectedPrediction.factors.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 text-sm">Key Factors:</h5>
                      <ul className="space-y-2">
                        {selectedPrediction.factors.map((factor, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPrediction.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 text-sm">Recommendations:</h5>
                      <ul className="space-y-2">
                        {selectedPrediction.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ML Models Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">ML Models Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {models.map((model, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{model.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {model.accuracy}% accurate
                    </Badge>
                  </div>
                  <Progress value={model.accuracy} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Prediction Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Predictions</span>
                <span className="font-semibold">{predictions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Confidence</span>
                <span className="font-semibold">
                  {Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">High Probability</span>
                <span className="font-semibold">
                  {predictions.filter(p => p.probability > 80).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Alerts</span>
                <span className="font-semibold text-red-500">
                  {predictions.filter(p => p.type === 'risk').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}