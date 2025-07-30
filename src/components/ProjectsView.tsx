import { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWorkspace } from '@/hooks/use-workspace';
import { useIsMobile } from '@/hooks/use-mobile';
import { springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  FolderOpen, 
  Plus, 
  Calendar as CalendarIcon,
  Users, 
  Target,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Share,
  Star,
  StarFilled,
  Flag,
  MapPin,
  PieChart,
  Activity
} from '@phosphor-icons/react';
import type { Project, Milestone, RiskAssessment, Client } from '@/lib/types';

export const ProjectsView = memo(() => {
  const isMobile = useIsMobile();
  const {
    currentWorkspace,
    projects,
    teamMembers,
    clients,
    createProject,
    updateProject,
    deleteProject,
    hasPermission,
    getWorkspaceProjects,
    getProjectMembers
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Project['priority'] | 'all'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    memberIds: [] as string[],
    clientId: '',
    budget: { allocated: 0, spent: 0, currency: 'USD' }
  });

  const workspaceProjects = currentWorkspace ? getWorkspaceProjects(currentWorkspace.id) : [];
  
  const filteredProjects = useMemo(() => {
    return workspaceProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [workspaceProjects, searchQuery, statusFilter, priorityFilter]);

  const selectedProject = workspaceProjects.find(p => p.id === selectedProjectId);
  const selectedProjectMembers = selectedProject ? getProjectMembers(selectedProject.id) : [];

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500';
      case 'active':
        return 'bg-green-500';
      case 'on-hold':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-purple-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateProjectProgress = (project: Project) => {
    // Mock calculation - in real app would be based on tasks/milestones
    const daysSinceStart = Math.floor((Date.now() - project.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = project.endDate 
      ? Math.floor((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    
    if (project.status === 'completed') return 100;
    if (project.status === 'cancelled') return 0;
    
    return Math.min(Math.max((daysSinceStart / totalDays) * 100, 0), 100);
  };

  const handleCreateProject = useCallback(async () => {
    if (!currentWorkspace || !newProject.name.trim()) return;

    setIsCreating(true);
    try {
      await createProject({
        ...newProject,
        workspaceId: currentWorkspace.id,
        ownerId: 'current-user-id',
        color: '#3B82F6',
        taskIds: [],
        milestoneIds: [],
        riskAssessments: [],
        tags: []
      });
      
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: new Date(),
        endDate: undefined,
        memberIds: [],
        clientId: '',
        budget: { allocated: 0, spent: 0, currency: 'USD' }
      });
    } finally {
      setIsCreating(false);
    }
  }, [currentWorkspace, newProject, createProject]);

  const handleUpdateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    await updateProject(projectId, updates);
  }, [updateProject]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    await deleteProject(projectId);
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  }, [deleteProject, selectedProjectId]);

  const getProjectStats = () => {
    const stats = {
      total: workspaceProjects.length,
      active: workspaceProjects.filter(p => p.status === 'active').length,
      completed: workspaceProjects.filter(p => p.status === 'completed').length,
      onHold: workspaceProjects.filter(p => p.status === 'on-hold').length,
      overBudget: workspaceProjects.filter(p => 
        p.budget && p.budget.spent > p.budget.allocated
      ).length
    };
    
    return stats;
  };

  const projectStats = getProjectStats();

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>No Workspace Selected</CardTitle>
            <CardDescription>
              Please select a workspace to view projects.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b bg-card/50 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage projects, track progress, and coordinate team efforts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Project Stats */}
          <div className="hidden sm:flex items-center gap-4 mr-4">
            <div className="text-center">
              <p className="text-lg font-bold">{projectStats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{projectStats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{projectStats.completed}</p>
              <p className="text-xs text-muted-foreground">Done</p>
            </div>
          </div>
          
          {hasPermission('projects', 'create') && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Set up a new project with team members and goals
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="Enter project name"
                        value={newProject.name}
                        onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea
                        id="project-description"
                        placeholder="Describe the project goals and scope"
                        value={newProject.description}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="project-status">Status</Label>
                      <Select
                        value={newProject.status}
                        onValueChange={(value: Project['status']) => setNewProject(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="project-priority">Priority</Label>
                      <Select
                        value={newProject.priority}
                        onValueChange={(value: Project['priority']) => setNewProject(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(newProject.startDate, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newProject.startDate}
                            onSelect={(date) => date && setNewProject(prev => ({ ...prev, startDate: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label>End Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newProject.endDate ? format(newProject.endDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newProject.endDate}
                            onSelect={(date) => setNewProject(prev => ({ ...prev, endDate: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label htmlFor="project-budget">Budget (Optional)</Label>
                      <Input
                        id="project-budget"
                        type="number"
                        placeholder="0"
                        value={newProject.budget.allocated}
                        onChange={(e) => setNewProject(prev => ({
                          ...prev,
                          budget: { ...prev.budget, allocated: Number(e.target.value) }
                        }))}
                      />
                    </div>
                    
                    {clients.length > 0 && (
                      <div>
                        <Label htmlFor="project-client">Client (Optional)</Label>
                        <Select
                          value={newProject.clientId}
                          onValueChange={(value) => setNewProject(prev => ({ ...prev, clientId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProject.name.trim() || isCreating}
                    className="w-full"
                  >
                    {isCreating ? 'Creating Project...' : 'Create Project'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Projects List/Grid */}
        <div className={cn(
          "flex flex-col",
          selectedProject ? (isMobile ? "hidden" : "w-1/2 border-r") : "flex-1"
        )}>
          {/* Filters */}
          <div className="p-4 border-b bg-card/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => {
                  const progress = calculateProjectProgress(project);
                  
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ ...springPresets.gentle, delay: index * 0.05 }}
                      className={cn(
                        "cursor-pointer",
                        selectedProjectId === project.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <Card className="glass-card hover:glass-elevated transition-all h-full">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{project.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {project.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <div 
                                  className={cn("w-3 h-3 rounded-full", getStatusColor(project.status))}
                                  title={project.status}
                                />
                                <Flag className={cn("w-4 h-4", getPriorityColor(project.priority))} />
                              </div>
                            </div>
                            
                            {/* Progress */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                            
                            {/* Team & Stats */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-1">
                                  {project.memberIds.slice(0, 3).map((memberId, idx) => {
                                    const member = teamMembers.find(m => m.id === memberId);
                                    return (
                                      <Avatar key={memberId} className="w-6 h-6 border-2 border-background">
                                        <AvatarImage src={member?.avatar} />
                                        <AvatarFallback className="text-xs">
                                          {member?.name[0] || '?'}
                                        </AvatarFallback>
                                      </Avatar>
                                    );
                                  })}
                                  {project.memberIds.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                      +{project.memberIds.length - 3}
                                    </div>
                                  )}
                                </div>
                                
                                {project.budget && project.budget.allocated > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    ${project.budget.spent}/${project.budget.allocated}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Target className="w-3 h-3" />
                                <span>{project.taskIds.length}</span>
                              </div>
                            </div>
                            
                            {/* Dates */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Started {format(project.startDate, 'MMM d')}</span>
                              {project.endDate && (
                                <span>Due {format(project.endDate, 'MMM d')}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Project Details Panel */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springPresets.gentle}
            className={cn(
              "flex flex-col bg-card/50 backdrop-blur-sm",
              isMobile ? "absolute inset-0 z-10" : "w-1/2"
            )}
          >
            {/* Project Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                    <Badge variant="outline">
                      {selectedProject.status}
                    </Badge>
                    <Flag className={cn("w-5 h-5", getPriorityColor(selectedProject.priority))} />
                  </div>
                  
                  {selectedProject.description && (
                    <p className="text-muted-foreground mt-2">
                      {selectedProject.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {isMobile && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedProjectId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {hasPermission('projects', 'update') && (
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold">{calculateProjectProgress(selectedProject).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{selectedProject.taskIds.length}</p>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{selectedProjectMembers.length}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
              </div>
            </div>

            {/* Project Content */}
            <div className="flex-1 overflow-auto">
              <Tabs defaultValue="overview" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 m-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex-1 p-4 space-y-4">
                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Start Date</span>
                          <span>{format(selectedProject.startDate, 'PPP')}</span>
                        </div>
                        {selectedProject.endDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span>End Date</span>
                            <span>{format(selectedProject.endDate, 'PPP')}</span>
                          </div>
                        )}
                        <Progress value={calculateProjectProgress(selectedProject)} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm">Project created</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(selectedProject.createdAt, 'MMM d, HH:mm')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tasks" className="flex-1 p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Project Tasks</CardTitle>
                      <CardDescription>
                        {selectedProject.taskIds.length} tasks in this project
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-muted-foreground py-8">
                        Task integration coming soon
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="team" className="flex-1 p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Team Members</CardTitle>
                      <CardDescription>
                        {selectedProjectMembers.length} members working on this project
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedProjectMembers.map(member => (
                          <div key={member.id} className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="budget" className="flex-1 p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Budget Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedProject.budget ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                              <p className="text-2xl font-bold text-green-600">
                                ${selectedProject.budget.allocated}
                              </p>
                              <p className="text-sm text-muted-foreground">Allocated</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">
                                ${selectedProject.budget.spent}
                              </p>
                              <p className="text-sm text-muted-foreground">Spent</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Budget Usage</span>
                              <span>
                                {selectedProject.budget.allocated > 0 
                                  ? ((selectedProject.budget.spent / selectedProject.budget.allocated) * 100).toFixed(1)
                                  : 0}%
                              </span>
                            </div>
                            <Progress 
                              value={selectedProject.budget.allocated > 0 
                                ? (selectedProject.budget.spent / selectedProject.budget.allocated) * 100 
                                : 0} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No budget set for this project
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

ProjectsView.displayName = 'ProjectsView';

export default ProjectsView;