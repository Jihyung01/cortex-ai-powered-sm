import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useWorkspace } from '@/hooks/use-workspace';
import { useIsMobile } from '@/hooks/use-mobile';
import { springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Plus, 
  Mail, 
  Settings, 
  Shield, 
  Crown, 
  Edit, 
  Trash2, 
  MoreVertical,
  Building,
  UserPlus,
  Search,
  Filter,
  Activity,
  Calendar,
  Clock,
  AlertTriangle
} from '@phosphor-icons/react';
import type { TeamMember, Department, TeamRole } from '@/lib/types';

export const TeamView = memo(() => {
  const isMobile = useIsMobile();
  const {
    currentWorkspace,
    teamMembers,
    departments,
    currentUserMember,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    hasPermission,
    getWorkspaceMembers,
    getWorkspaceDepartments,
    getDepartmentMembers
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamRole | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string | 'all'>('all');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'viewer' as TeamRole,
    departmentId: '',
    message: ''
  });

  const workspaceMembers = currentWorkspace ? getWorkspaceMembers(currentWorkspace.id) : [];
  const workspaceDepartments = currentWorkspace ? getWorkspaceDepartments(currentWorkspace.id) : [];

  const filteredMembers = workspaceMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleInviteMember = useCallback(async () => {
    if (!inviteForm.email || !hasPermission('settings', 'update')) return;

    setIsInviting(true);
    try {
      await inviteTeamMember({
        email: inviteForm.email,
        role: inviteForm.role,
        departmentId: inviteForm.departmentId || undefined,
        message: inviteForm.message
      });
      
      setInviteForm({
        email: '',
        role: 'viewer',
        departmentId: '',
        message: ''
      });
      
      // Close dialog in mobile
      if (isMobile) {
        // This would close the dialog/bottom sheet
      }
    } finally {
      setIsInviting(false);
    }
  }, [inviteForm, inviteTeamMember, hasPermission, isMobile]);

  const handleUpdateMemberRole = useCallback(async (memberId: string, newRole: TeamRole) => {
    if (!hasPermission('settings', 'update')) return;
    
    await updateTeamMember(memberId, { role: newRole });
  }, [updateTeamMember, hasPermission]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    if (!hasPermission('settings', 'update')) return;
    
    await removeTeamMember(memberId);
  }, [removeTeamMember, hasPermission]);

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: TeamRole) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'editor':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'invited':
        return 'text-yellow-500';
      case 'inactive':
        return 'text-gray-500';
      case 'suspended':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>No Workspace Selected</CardTitle>
            <CardDescription>
              Please select a workspace to manage team members.
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
      className="flex flex-col h-full p-4 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage members, departments, and permissions for {currentWorkspace.name}
          </p>
        </div>
        
        {hasPermission('settings', 'update') && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join {currentWorkspace.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: TeamRole) => setInviteForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {workspaceDepartments.length > 0 && (
                  <div>
                    <Label htmlFor="department">Department (Optional)</Label>
                    <Select
                      value={inviteForm.departmentId}
                      onValueChange={(value) => setInviteForm(prev => ({ ...prev, departmentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaceDepartments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Welcome to our team! Looking forward to working with you."
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <Button
                  onClick={handleInviteMember}
                  disabled={!inviteForm.email || isInviting}
                  className="w-full"
                >
                  {isInviting ? 'Sending Invitation...' : 'Send Invitation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
              
              {workspaceDepartments.length > 0 && (
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {workspaceDepartments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members ({filteredMembers.length})</TabsTrigger>
          <TabsTrigger value="departments">Departments ({workspaceDepartments.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ ...springPresets.gentle, delay: index * 0.05 }}
                >
                  <Card className="glass-card hover:glass-elevated transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{member.name}</h3>
                              {getRoleIcon(member.role)}
                              <Badge variant={getRoleBadgeVariant(member.role)}>
                                {member.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            {member.title && (
                              <p className="text-sm text-muted-foreground">{member.title}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(member.status))} />
                            <p className="text-xs text-muted-foreground capitalize">
                              {member.status}
                            </p>
                            {member.lastSeen && (
                              <p className="text-xs text-muted-foreground">
                                Last seen {new Date(member.lastSeen).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          
                          {hasPermission('settings', 'update') && member.id !== currentUserMember?.id && (
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4">
            {workspaceDepartments.map((department, index) => {
              const departmentMembers = getDepartmentMembers(department.id);
              
              return (
                <motion.div
                  key={department.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springPresets.gentle, delay: index * 0.1 }}
                >
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: department.color }}
                          />
                          <div>
                            <h3 className="font-medium">{department.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {departmentMembers.length} members
                            </p>
                          </div>
                        </div>
                        
                        {hasPermission('settings', 'update') && (
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {department.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {department.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Members</span>
                </div>
                <p className="text-2xl font-bold">{workspaceMembers.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Active Today</span>
                </div>
                <p className="text-2xl font-bold">
                  {workspaceMembers.filter(m => m.status === 'active').length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Departments</span>
                </div>
                <p className="text-2xl font-bold">{workspaceDepartments.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Pending Invites</span>
                </div>
                <p className="text-2xl font-bold">
                  {workspaceMembers.filter(m => m.status === 'invited').length}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
});

TeamView.displayName = 'TeamView';

export default TeamView;