import { useKV } from '@github/spark/hooks';
import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/enterprise';
import type { 
  Workspace, 
  TeamMember, 
  Department, 
  Project, 
  TeamRole,
  Permission,
  AuditLog,
  Client
} from '../lib/types';

export function useWorkspace() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useKV<Workspace[]>('cortex-workspaces', []);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useKV<string | undefined>('cortex-current-workspace', undefined);
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>('cortex-team-members', []);
  const [departments, setDepartments] = useKV<Department[]>('cortex-departments', []);
  const [projects, setProjects] = useKV<Project[]>('cortex-projects', []);
  const [auditLogs, setAuditLogs] = useKV<AuditLog[]>('cortex-audit-logs', []);
  const [clients, setClients] = useKV<Client[]>('cortex-clients', []);

  const currentWorkspace = useMemo(() => {
    return workspaces.find(w => w.id === currentWorkspaceId);
  }, [workspaces, currentWorkspaceId]);

  const currentUserMember = useMemo(() => {
    // Get current user's ID from authentication, with fallback
    const currentUserId = user?.id || 'demo-user';
    return teamMembers.find(m => m.userId === currentUserId && m.workspaceId === currentWorkspaceId);
  }, [teamMembers, currentWorkspaceId, user?.id]);

  const createWorkspace = useCallback(async (workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkspace: Workspace = {
      ...workspaceData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setWorkspaces(current => [...current, newWorkspace]);
    
    // Add creator as owner
    const ownerMember: TeamMember = {
      id: crypto.randomUUID(),
      userId: workspaceData.ownerId,
      workspaceId: newWorkspace.id,
      email: 'owner@example.com', // This would come from user profile
      name: 'Workspace Owner',
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      permissions: getAllPermissions()
    };
    
    setTeamMembers(current => [...current, ownerMember]);
    setCurrentWorkspaceId(newWorkspace.id);
    
    // Log workspace creation
    logAction('create', 'workspace', newWorkspace.id, { name: newWorkspace.name });
    
    return newWorkspace;
  }, [setWorkspaces, setTeamMembers, setCurrentWorkspaceId]);

  const updateWorkspace = useCallback(async (id: string, updates: Partial<Workspace>) => {
    setWorkspaces(current =>
      current.map(workspace =>
        workspace.id === id
          ? { ...workspace, ...updates, updatedAt: new Date() }
          : workspace
      )
    );
    
    logAction('update', 'workspace', id, updates);
  }, [setWorkspaces]);

  const deleteWorkspace = useCallback(async (id: string) => {
    setWorkspaces(current => current.filter(w => w.id !== id));
    setTeamMembers(current => current.filter(m => m.workspaceId !== id));
    setDepartments(current => current.filter(d => d.workspaceId !== id));
    setProjects(current => current.filter(p => p.workspaceId !== id));
    
    if (currentWorkspaceId === id) {
      const remainingWorkspaces = workspaces.filter(w => w.id !== id);
      setCurrentWorkspaceId(remainingWorkspaces.length > 0 ? remainingWorkspaces[0].id : undefined);
    }
    
    logAction('delete', 'workspace', id, {});
  }, [setWorkspaces, setTeamMembers, setDepartments, setProjects, workspaces, currentWorkspaceId, setCurrentWorkspaceId]);

  const inviteTeamMember = useCallback(async (invitation: {
    email: string;
    role: TeamRole;
    departmentId?: string;
    message?: string;
  }) => {
    if (!currentWorkspaceId) return;

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(), // Would be set when user accepts invitation
      workspaceId: currentWorkspaceId,
      email: invitation.email,
      name: invitation.email.split('@')[0], // Temporary name
      role: invitation.role,
      department: invitation.departmentId,
      status: 'invited',
      joinedAt: new Date(),
      permissions: getPermissionsForRole(invitation.role)
    };

    setTeamMembers(current => [...current, newMember]);
    
    // In a real app, this would send an invitation email
    console.log('Invitation sent to:', invitation.email);
    
    logAction('invite', 'team_member', newMember.id, { email: invitation.email, role: invitation.role });
    
    return newMember;
  }, [currentWorkspaceId, setTeamMembers]);

  const updateTeamMember = useCallback(async (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers(current =>
      current.map(member =>
        member.id === id
          ? { ...member, ...updates }
          : member
      )
    );
    
    logAction('update', 'team_member', id, updates);
  }, [setTeamMembers]);

  const removeTeamMember = useCallback(async (id: string) => {
    setTeamMembers(current => current.filter(m => m.id !== id));
    logAction('remove', 'team_member', id, {});
  }, [setTeamMembers]);

  const createDepartment = useCallback(async (departmentData: Omit<Department, 'id' | 'createdAt'>) => {
    if (!currentWorkspaceId) return;

    const newDepartment: Department = {
      ...departmentData,
      id: crypto.randomUUID(),
      workspaceId: currentWorkspaceId,
      createdAt: new Date()
    };

    setDepartments(current => [...current, newDepartment]);
    logAction('create', 'department', newDepartment.id, { name: newDepartment.name });
    
    return newDepartment;
  }, [currentWorkspaceId, setDepartments]);

  const updateDepartment = useCallback(async (id: string, updates: Partial<Department>) => {
    setDepartments(current =>
      current.map(dept =>
        dept.id === id
          ? { ...dept, ...updates }
          : dept
      )
    );
    
    logAction('update', 'department', id, updates);
  }, [setDepartments]);

  const deleteDepartment = useCallback(async (id: string) => {
    setDepartments(current => current.filter(d => d.id !== id));
    // Update team members to remove department reference
    setTeamMembers(current =>
      current.map(member =>
        member.department === id
          ? { ...member, department: undefined }
          : member
      )
    );
    
    logAction('delete', 'department', id, {});
  }, [setDepartments, setTeamMembers]);

  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentWorkspaceId) return;

    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      workspaceId: currentWorkspaceId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setProjects(current => [...current, newProject]);
    logAction('create', 'project', newProject.id, { name: newProject.name });
    
    return newProject;
  }, [currentWorkspaceId, setProjects]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    setProjects(current =>
      current.map(project =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      )
    );
    
    logAction('update', 'project', id, updates);
  }, [setProjects]);

  const deleteProject = useCallback(async (id: string) => {
    setProjects(current => current.filter(p => p.id !== id));
    logAction('delete', 'project', id, {});
  }, [setProjects]);

  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (!currentWorkspaceId) return;

    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      workspaceId: currentWorkspaceId,
      createdAt: new Date()
    };

    setClients(current => [...current, newClient]);
    logAction('create', 'client', newClient.id, { name: newClient.name });
    
    return newClient;
  }, [currentWorkspaceId, setClients]);

  const logAction = useCallback((action: string, resource: string, resourceId: string, details: Record<string, any>) => {
    if (!currentWorkspaceId || !currentUserMember) return;

    const logEntry: AuditLog = {
      id: crypto.randomUUID(),
      workspaceId: currentWorkspaceId,
      userId: currentUserMember.userId,
      userName: currentUserMember.name,
      action,
      resource,
      resourceId,
      details,
      ipAddress: '127.0.0.1', // Would be actual IP in real app
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      severity: getSeverityForAction(action, resource)
    };

    setAuditLogs(current => [...current, logEntry]);
  }, [currentWorkspaceId, currentUserMember, setAuditLogs]);

  const hasPermission = useCallback((resource: Permission['resource'], action: Permission['actions'][0]): boolean => {
    // In demo mode or when no member found, allow all permissions
    if (!currentUserMember) return true;
    
    return currentUserMember.permissions.some(permission =>
      permission.resource === resource && permission.actions.includes(action)
    );
  }, [currentUserMember]);

  const getWorkspaceMembers = useCallback((workspaceId: string) => {
    return teamMembers.filter(m => m.workspaceId === workspaceId);
  }, [teamMembers]);

  const getWorkspaceDepartments = useCallback((workspaceId: string) => {
    return departments.filter(d => d.workspaceId === workspaceId);
  }, [departments]);

  const getWorkspaceProjects = useCallback((workspaceId: string) => {
    return projects.filter(p => p.workspaceId === workspaceId);
  }, [projects]);

  const getDepartmentMembers = useCallback((departmentId: string) => {
    return teamMembers.filter(m => m.department === departmentId);
  }, [teamMembers]);

  const getProjectMembers = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? teamMembers.filter(m => project.memberIds.includes(m.id)) : [];
  }, [projects, teamMembers]);

  return {
    // State
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    teamMembers,
    departments,
    projects,
    auditLogs,
    clients,
    currentUserMember,

    // Actions
    setCurrentWorkspaceId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createProject,
    updateProject,
    deleteProject,
    createClient,
    hasPermission,

    // Getters
    getWorkspaceMembers,
    getWorkspaceDepartments,
    getWorkspaceProjects,
    getDepartmentMembers,
    getProjectMembers
  };
}

// Helper functions
function getAllPermissions(): Permission[] {
  return [
    { resource: 'notes', actions: ['create', 'read', 'update', 'delete', 'share', 'export'] },
    { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'share', 'export'] },
    { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'share', 'export'] },
    { resource: 'analytics', actions: ['read', 'export'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'integrations', actions: ['create', 'read', 'update', 'delete'] }
  ];
}

function getPermissionsForRole(role: TeamRole): Permission[] {
  switch (role) {
    case 'owner':
    case 'admin':
      return getAllPermissions();
    
    case 'editor':
      return [
        { resource: 'notes', actions: ['create', 'read', 'update', 'delete', 'share'] },
        { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'share'] },
        { resource: 'projects', actions: ['read', 'update', 'share'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    
    case 'viewer':
      return [
        { resource: 'notes', actions: ['read'] },
        { resource: 'tasks', actions: ['read'] },
        { resource: 'projects', actions: ['read'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    
    case 'guest':
      return [
        { resource: 'notes', actions: ['read'] },
        { resource: 'tasks', actions: ['read'] }
      ];
    
    default:
      return [];
  }
}

function getSeverityForAction(action: string, resource: string): AuditLog['severity'] {
  if (action === 'delete' && ['workspace', 'project'].includes(resource)) {
    return 'critical';
  }
  if (action === 'invite' || action === 'remove') {
    return 'high';
  }
  if (action === 'create') {
    return 'medium';
  }
  return 'low';
}