import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  MapIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ComposedChart,
  Bar,
  Area
} from 'recharts';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';
import { springPresets } from '@/hooks/use-motion';

interface DataVisualizationProps {
  data: any;
  timeRange: string;
}

type VisualizationType = 'heatmap' | 'flow' | 'network' | 'sankey' | 'timeline' | 'treemap';

export function DataVisualization({ data, timeRange }: DataVisualizationProps) {
  const [selectedVisualization, setSelectedVisualization] = useState<VisualizationType>('heatmap');
  const [viewMode, setViewMode] = useState<'interactive' | 'static'>('interactive');

  // Generate heat map data for productivity patterns
  const heatMapData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.flatMap(day => 
      hours.map(hour => ({
        day,
        hour,
        value: Math.floor(Math.random() * 100),
        productivity: Math.floor(Math.random() * 100)
      }))
    );
  }, []);

  // Generate Sankey diagram data for time allocation
  const sankeyData = useMemo(() => {
    return {
      nodes: [
        { id: 'total-time', name: 'Total Time' },
        { id: 'work', name: 'Work' },
        { id: 'personal', name: 'Personal' },
        { id: 'sleep', name: 'Sleep' },
        { id: 'deep-work', name: 'Deep Work' },
        { id: 'meetings', name: 'Meetings' },
        { id: 'admin', name: 'Admin' },
        { id: 'breaks', name: 'Breaks' },
        { id: 'exercise', name: 'Exercise' },
        { id: 'family', name: 'Family' },
        { id: 'hobbies', name: 'Hobbies' }
      ],
      links: [
        { source: 'total-time', target: 'work', value: 8 },
        { source: 'total-time', target: 'personal', value: 8 },
        { source: 'total-time', target: 'sleep', value: 8 },
        { source: 'work', target: 'deep-work', value: 4 },
        { source: 'work', target: 'meetings', value: 2 },
        { source: 'work', target: 'admin', value: 1.5 },
        { source: 'work', target: 'breaks', value: 0.5 },
        { source: 'personal', target: 'exercise', value: 1 },
        { source: 'personal', target: 'family', value: 4 },
        { source: 'personal', target: 'hobbies', value: 3 }
      ]
    };
  }, []);

  // Generate network data for collaboration patterns
  const networkData = useMemo(() => {
    const nodes = [
      { id: 'you', name: 'You', group: 'self', size: 20 },
      { id: 'team-a', name: 'Team A', group: 'team', size: 15 },
      { id: 'team-b', name: 'Team B', group: 'team', size: 15 },
      { id: 'manager', name: 'Manager', group: 'leadership', size: 18 },
      { id: 'client-1', name: 'Client Alpha', group: 'external', size: 12 },
      { id: 'client-2', name: 'Client Beta', group: 'external', size: 10 },
      { id: 'vendor', name: 'Vendor', group: 'external', size: 8 }
    ];
    
    const links = [
      { source: 'you', target: 'team-a', value: 25, type: 'frequent' },
      { source: 'you', target: 'team-b', value: 15, type: 'regular' },
      { source: 'you', target: 'manager', value: 20, type: 'frequent' },
      { source: 'you', target: 'client-1', value: 10, type: 'occasional' },
      { source: 'you', target: 'client-2', value: 8, type: 'occasional' },
      { source: 'team-a', target: 'client-1', value: 12, type: 'regular' },
      { source: 'manager', target: 'vendor', value: 5, type: 'rare' }
    ];
    
    return { nodes, links };
  }, []);

  // Generate timeline data for project evolution
  const timelineData = useMemo(() => {
    return [
      {
        date: '2024-01-01',
        projects: 3,
        completedTasks: 45,
        newTasks: 52,
        teamSize: 8,
        productivity: 78
      },
      {
        date: '2024-02-01',
        projects: 4,
        completedTasks: 62,
        newTasks: 48,
        teamSize: 9,
        productivity: 82
      },
      {
        date: '2024-03-01',
        projects: 5,
        completedTasks: 78,
        newTasks: 65,
        teamSize: 10,
        productivity: 85
      },
      {
        date: '2024-04-01',
        projects: 4,
        completedTasks: 89,
        newTasks: 43,
        teamSize: 12,
        productivity: 88
      }
    ];
  }, []);

  // Generate treemap data for resource allocation
  const treemapData = useMemo(() => {
    return [
      {
        name: 'Development',
        size: 4500,
        children: [
          { name: 'Frontend', size: 2000 },
          { name: 'Backend', size: 1500 },
          { name: 'DevOps', size: 1000 }
        ]
      },
      {
        name: 'Design',
        size: 2000,
        children: [
          { name: 'UI/UX', size: 1200 },
          { name: 'Research', size: 800 }
        ]
      },
      {
        name: 'Management',
        size: 1500,
        children: [
          { name: 'Planning', size: 800 },
          { name: 'Coordination', size: 700 }
        ]
      },
      {
        name: 'Testing',
        size: 1000,
        children: [
          { name: 'QA', size: 600 },
          { name: 'Automation', size: 400 }
        ]
      }
    ];
  }, []);

  const visualizations = [
    {
      id: 'heatmap',
      name: 'Activity Heat Map',
      description: 'Productivity patterns by day and hour',
      icon: MapIcon,
      component: HeatMapVisualization
    },
    {
      id: 'sankey',
      name: 'Time Flow Diagram',
      description: 'Resource allocation and time flow',
      icon: ArrowsRightLeftIcon,
      component: SankeyVisualization
    },
    {
      id: 'network',
      name: 'Collaboration Network',
      description: 'Team interaction patterns',
      icon: GlobeAltIcon,
      component: NetworkVisualization
    },
    {
      id: 'timeline',
      name: 'Project Timeline',
      description: 'Evolution of projects and metrics',
      icon: ChartBarIcon,
      component: TimelineVisualization
    },
    {
      id: 'treemap',
      name: 'Resource Treemap',
      description: 'Hierarchical resource distribution',
      icon: AdjustmentsHorizontalIcon,
      component: TreemapVisualization
    }
  ];

  const currentVisualization = visualizations.find(v => v.id === selectedVisualization);

  // Visualization Components
  function HeatMapVisualization() {
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 100]);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Productivity Heat Map</h4>
          <Badge variant="outline">Peak: 9-11 AM</Badge>
        </div>
        
        <div className="grid gap-1 p-4 bg-card rounded-lg" style={{ gridTemplateColumns: 'auto repeat(24, 1fr)' }}>
          {/* Hour labels */}
          <div className="col-span-1"></div>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="text-xs text-center text-muted-foreground">
              {i}
            </div>
          ))}
          
          {/* Heat map cells */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="contents">
              <div className="text-xs text-muted-foreground py-1">{day}</div>
              {Array.from({ length: 24 }, (_, hour) => {
                const dataPoint = heatMapData.find(d => d.day === day && d.hour === hour);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="w-4 h-4 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    style={{ backgroundColor: colorScale(dataPoint?.value || 0) }}
                    title={`${day} ${hour}:00 - ${dataPoint?.value || 0}% productivity`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Low Activity</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div 
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colorScale(i * 25) }}
              />
            ))}
          </div>
          <span>High Activity</span>
        </div>
      </div>
    );
  }

  function SankeyVisualization() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Time Allocation Flow</h4>
          <Badge variant="outline">24 hours</Badge>
        </div>
        
        <div className="h-80 bg-card rounded-lg p-4 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ArrowsRightLeftIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Interactive Sankey diagram would be rendered here</p>
            <p className="text-sm">Showing flow from total time to specific activities</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-2">Time Sources</h5>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Work: 8 hours</li>
              <li>• Personal: 8 hours</li>
              <li>• Sleep: 8 hours</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Activity Breakdown</h5>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Deep Work: 4 hours</li>
              <li>• Meetings: 2 hours</li>
              <li>• Admin: 1.5 hours</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  function NetworkVisualization() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Collaboration Network</h4>
          <Badge variant="outline">7 connections</Badge>
        </div>
        
        <div className="h-80 bg-card rounded-lg p-4 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <GlobeAltIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Interactive network graph would be rendered here</p>
            <p className="text-sm">Showing collaboration patterns and team connections</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold">25</div>
            <div className="text-muted-foreground">Strong Connections</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">12</div>
            <div className="text-muted-foreground">Regular Contact</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">5</div>
            <div className="text-muted-foreground">Occasional</div>
          </div>
        </div>
      </div>
    );
  }

  function TimelineVisualization() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Project Evolution Timeline</h4>
          <Badge variant="outline">4 months</Badge>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 240)" />
            <XAxis 
              dataKey="date" 
              stroke="oklch(0.45 0.02 270)"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
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
            <Bar dataKey="projects" fill="#6366f1" opacity={0.7} />
            <Line type="monotone" dataKey="productivity" stroke="#8b5cf6" strokeWidth={3} />
            <Line type="monotone" dataKey="teamSize" stroke="#06b6d4" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span>Active Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-sm" />
            <span>Productivity %</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-sm" />
            <span>Team Size</span>
          </div>
        </div>
      </div>
    );
  }

  function TreemapVisualization() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Resource Allocation Treemap</h4>
          <Badge variant="outline">9000 hours</Badge>
        </div>
        
        <div className="h-80 bg-card rounded-lg p-4 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <AdjustmentsHorizontalIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Interactive treemap would be rendered here</p>
            <p className="text-sm">Showing hierarchical resource distribution</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {treemapData.map(category => (
            <div key={category.name} className="text-center">
              <div className="text-lg font-semibold">{category.size}</div>
              <div className="text-muted-foreground">{category.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10">
                <ChartBarIcon className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl">Advanced Data Visualization</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Interactive charts and specialized visualizations for deep analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32 glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interactive">Interactive</SelectItem>
                  <SelectItem value="static">Static</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualization Types */}
        <div className="space-y-4">
          <h3 className="font-semibold">Visualization Types</h3>
          {visualizations.map((viz, index) => (
            <motion.div
              key={viz.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, ...springPresets.gentle }}
            >
              <Card 
                className={cn(
                  "glass-card hover:glass-elevated transition-all duration-300 cursor-pointer",
                  selectedVisualization === viz.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedVisualization(viz.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
                      <viz.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{viz.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {viz.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Visualization */}
        <div className="lg:col-span-3">
          <motion.div
            key={selectedVisualization}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.smooth}
          >
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {currentVisualization && <currentVisualization.icon className="w-5 h-5" />}
                    {currentVisualization?.name}
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Export View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {currentVisualization && <currentVisualization.component />}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}