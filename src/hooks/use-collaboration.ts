import { useKV } from '@github/spark/hooks';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  CollaborationSession,
  SessionParticipant,
  CollaborationOperation,
  TeamMessage,
  Channel
} from '../lib/types';

export function useCollaboration() {
  const [sessions, setSessions] = useKV<CollaborationSession[]>('cortex-collaboration-sessions', []);
  const [activeSessionId, setActiveSessionId] = useKV<string | undefined>('cortex-active-session', undefined);
  const [messages, setMessages] = useKV<TeamMessage[]>('cortex-team-messages', []);
  const [channels, setChannels] = useKV<Channel[]>('cortex-channels', []);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Simulated WebSocket connection for real-time updates
  const wsRef = useRef<{ send: (data: any) => void } | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket simulation
  useEffect(() => {
    // In a real app, this would be an actual WebSocket connection
    wsRef.current = {
      send: (data: any) => {
        console.log('Sending to WebSocket:', data);
        // Simulate real-time updates by broadcasting to other participants
        simulateRealTimeUpdate(data);
      }
    };

    // Heartbeat to maintain connection
    heartbeatRef.current = setInterval(() => {
      if (wsRef.current && activeSessionId) {
        wsRef.current.send({ type: 'heartbeat', sessionId: activeSessionId });
      }
    }, 30000); // 30 seconds

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeSessionId]);

  const simulateRealTimeUpdate = useCallback((data: any) => {
    // Simulate real-time collaboration updates
    setTimeout(() => {
      if (data.type === 'operation') {
        setSessions(current => 
          current.map(session => 
            session.id === data.sessionId
              ? { ...session, operations: [...session.operations, data.operation] }
              : session
          )
        );
      } else if (data.type === 'cursor_update') {
        setSessions(current =>
          current.map(session =>
            session.id === data.sessionId
              ? {
                  ...session,
                  participants: session.participants.map(p =>
                    p.userId === data.userId
                      ? { ...p, cursor: data.cursor, lastActivity: new Date() }
                      : p
                  )
                }
              : session
          )
        );
      }
    }, Math.random() * 500 + 100); // Simulate network delay
  }, [setSessions]);

  const startCollaborationSession = useCallback(async (
    documentId: string, 
    documentType: 'note' | 'task' | 'project'
  ) => {
    const sessionId = crypto.randomUUID();
    const currentUserId = 'current-user-id'; // Would come from auth context
    
    const newSession: CollaborationSession = {
      id: sessionId,
      documentId,
      documentType,
      participants: [{
        userId: currentUserId,
        name: 'Current User', // Would come from user profile
        isActive: true,
        joinedAt: new Date(),
        lastActivity: new Date()
      }],
      startedAt: new Date(),
      operations: []
    };

    setSessions(current => [...current, newSession]);
    setActiveSessionId(sessionId);

    // Notify other users about the session
    if (wsRef.current) {
      wsRef.current.send({
        type: 'session_started',
        sessionId,
        documentId,
        documentType,
        userId: currentUserId
      });
    }

    return sessionId;
  }, [setSessions, setActiveSessionId]);

  const joinCollaborationSession = useCallback(async (sessionId: string) => {
    const currentUserId = 'current-user-id';
    
    setSessions(current =>
      current.map(session =>
        session.id === sessionId
          ? {
              ...session,
              participants: [
                ...session.participants.filter(p => p.userId !== currentUserId),
                {
                  userId: currentUserId,
                  name: 'Current User',
                  isActive: true,
                  joinedAt: new Date(),
                  lastActivity: new Date()
                }
              ]
            }
          : session
      )
    );

    setActiveSessionId(sessionId);

    if (wsRef.current) {
      wsRef.current.send({
        type: 'user_joined',
        sessionId,
        userId: currentUserId
      });
    }
  }, [setSessions, setActiveSessionId]);

  const leaveCollaborationSession = useCallback(async (sessionId?: string) => {
    const targetSessionId = sessionId || activeSessionId;
    if (!targetSessionId) return;

    const currentUserId = 'current-user-id';

    setSessions(current =>
      current.map(session =>
        session.id === targetSessionId
          ? {
              ...session,
              participants: session.participants.map(p =>
                p.userId === currentUserId
                  ? { ...p, isActive: false }
                  : p
              )
            }
          : session
      )
    );

    if (targetSessionId === activeSessionId) {
      setActiveSessionId(undefined);
    }

    if (wsRef.current) {
      wsRef.current.send({
        type: 'user_left',
        sessionId: targetSessionId,
        userId: currentUserId
      });
    }
  }, [activeSessionId, setSessions, setActiveSessionId]);

  const endCollaborationSession = useCallback(async (sessionId: string) => {
    setSessions(current =>
      current.map(session =>
        session.id === sessionId
          ? { ...session, endedAt: new Date() }
          : session
      )
    );

    if (sessionId === activeSessionId) {
      setActiveSessionId(undefined);
    }

    if (wsRef.current) {
      wsRef.current.send({
        type: 'session_ended',
        sessionId
      });
    }
  }, [setSessions, activeSessionId, setActiveSessionId]);

  const applyCollaborationOperation = useCallback(async (
    sessionId: string,
    operation: Omit<CollaborationOperation, 'id' | 'timestamp' | 'vector'>
  ) => {
    const fullOperation: CollaborationOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      vector: generateOperationVector() // Simplified vector for conflict resolution
    };

    setSessions(current =>
      current.map(session =>
        session.id === sessionId
          ? { ...session, operations: [...session.operations, fullOperation] }
          : session
      )
    );

    // Broadcast operation to other participants
    if (wsRef.current) {
      wsRef.current.send({
        type: 'operation',
        sessionId,
        operation: fullOperation
      });
    }

    return fullOperation;
  }, [setSessions]);

  const updateCursorPosition = useCallback(async (
    sessionId: string,
    position: number,
    selection?: { start: number; end: number }
  ) => {
    const currentUserId = 'current-user-id';

    setSessions(current =>
      current.map(session =>
        session.id === sessionId
          ? {
              ...session,
              participants: session.participants.map(p =>
                p.userId === currentUserId
                  ? { 
                      ...p, 
                      cursor: { position, selection },
                      lastActivity: new Date()
                    }
                  : p
              )
            }
          : session
      )
    );

    // Throttled cursor updates to avoid spam
    if (wsRef.current) {
      wsRef.current.send({
        type: 'cursor_update',
        sessionId,
        userId: currentUserId,
        cursor: { position, selection }
      });
    }
  }, [setSessions]);

  const sendMessage = useCallback(async (channelId: string, content: string, messageType: TeamMessage['messageType'] = 'text') => {
    const currentUserId = 'current-user-id';
    
    const newMessage: TeamMessage = {
      id: crypto.randomUUID(),
      workspaceId: 'current-workspace-id', // Would come from context
      senderId: currentUserId,
      senderName: 'Current User',
      channelId,
      content,
      messageType,
      attachments: [],
      reactions: [],
      mentionedUserIds: extractMentions(content),
      linkedDocuments: extractLinkedDocuments(content),
      isEdited: false,
      createdAt: new Date()
    };

    setMessages(current => [...current, newMessage]);

    // Send real-time notification
    if (wsRef.current) {
      wsRef.current.send({
        type: 'message',
        channelId,
        message: newMessage
      });
    }

    return newMessage;
  }, [setMessages]);

  const createChannel = useCallback(async (channelData: Omit<Channel, 'id' | 'createdAt'>) => {
    const newChannel: Channel = {
      ...channelData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };

    setChannels(current => [...current, newChannel]);
    return newChannel;
  }, [setChannels]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    const currentUserId = 'current-user-id';

    setMessages(current =>
      current.map(message =>
        message.id === messageId
          ? {
              ...message,
              reactions: message.reactions.map(reaction =>
                reaction.emoji === emoji
                  ? {
                      ...reaction,
                      userIds: reaction.userIds.includes(currentUserId)
                        ? reaction.userIds.filter(id => id !== currentUserId)
                        : [...reaction.userIds, currentUserId],
                      count: reaction.userIds.includes(currentUserId)
                        ? reaction.count - 1
                        : reaction.count + 1
                    }
                  : reaction
              ).concat(
                !message.reactions.find(r => r.emoji === emoji)
                  ? [{ emoji, userIds: [currentUserId], count: 1 }]
                  : []
              )
            }
          : message
      )
    );
  }, [setMessages]);

  const getActiveSession = useCallback(() => {
    return sessions.find(s => s.id === activeSessionId);
  }, [sessions, activeSessionId]);

  const getChannelMessages = useCallback((channelId: string) => {
    return messages
      .filter(m => m.channelId === channelId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages]);

  const getOnlineParticipants = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.participants.filter(p => p.isActive) || [];
  }, [sessions]);

  // Conflict resolution for collaborative operations
  const resolveConflicts = useCallback((operations: CollaborationOperation[]) => {
    // Simplified operational transformation
    // In a real app, this would be much more sophisticated
    return operations.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, []);

  return {
    // State
    sessions,
    activeSessionId,
    messages,
    channels,
    isOnline,

    // Collaboration
    startCollaborationSession,
    joinCollaborationSession,
    leaveCollaborationSession,
    endCollaborationSession,
    applyCollaborationOperation,
    updateCursorPosition,
    getActiveSession,
    getOnlineParticipants,
    resolveConflicts,

    // Messaging
    sendMessage,
    createChannel,
    addReaction,
    getChannelMessages
  };
}

// Helper functions
function generateOperationVector(): number[] {
  // Simplified vector clock for conflict resolution
  return [Math.floor(Math.random() * 1000), Date.now()];
}

function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

function extractLinkedDocuments(content: string): TeamMessage['linkedDocuments'] {
  // Extract document links from content (simplified)
  const linkRegex = /\[([^\]]+)\]\(#(note|task|project):([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      type: match[2] as 'note' | 'task' | 'project',
      id: match[3],
      title: match[1]
    });
  }
  
  return links;
}