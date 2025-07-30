import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCollaboration } from '@/hooks/use-collaboration';
import { useWorkspace } from '@/hooks/use-workspace';
import { useIsMobile } from '@/hooks/use-mobile';
import { springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { 
  Users, 
  MessageCircle, 
  Video, 
  Share, 
  Edit, 
  Eye,
  Send,
  Smile,
  Paperclip,
  Phone,
  Monitor,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  Clock,
  CheckCircle,
  Circle,
  Play,
  Pause,
  Hash,
  Plus,
  Search,
  Bell,
  BellOff,
  MoreVertical
} from '@phosphor-icons/react';
import type { SessionParticipant, TeamMessage, Channel } from '@/lib/types';

export const CollaborationView = memo(() => {
  const isMobile = useIsMobile();
  const {
    sessions,
    activeSessionId,
    messages,
    channels,
    isOnline,
    startCollaborationSession,
    joinCollaborationSession,
    leaveCollaborationSession,
    updateCursorPosition,
    sendMessage,
    createChannel,
    addReaction,
    getActiveSession,
    getChannelMessages,
    getOnlineParticipants
  } = useCollaboration();

  const { teamMembers, currentWorkspace } = useWorkspace();

  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const activeSession = getActiveSession();
  const selectedChannel = channels.find(c => c.id === selectedChannelId);
  const channelMessages = selectedChannelId ? getChannelMessages(selectedChannelId) : [];
  const onlineParticipants = activeSessionId ? getOnlineParticipants(activeSessionId) : [];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  // Auto-focus message input when channel changes
  useEffect(() => {
    if (selectedChannelId && !isMobile) {
      messageInputRef.current?.focus();
    }
  }, [selectedChannelId, isMobile]);

  const handleStartSession = useCallback(async (documentId: string, documentType: 'note' | 'task' | 'project') => {
    const sessionId = await startCollaborationSession(documentId, documentType);
    if (sessionId) {
      // Navigate to the document with collaboration mode
      console.log('Started collaboration session:', sessionId);
    }
  }, [startCollaborationSession]);

  const handleJoinSession = useCallback(async (sessionId: string) => {
    await joinCollaborationSession(sessionId);
  }, [joinCollaborationSession]);

  const handleLeaveSession = useCallback(async () => {
    if (activeSessionId) {
      await leaveCollaborationSession(activeSessionId);
    }
  }, [activeSessionId, leaveCollaborationSession]);

  const handleSendMessage = useCallback(async () => {
    if (!selectedChannelId || !messageInput.trim()) return;

    await sendMessage(selectedChannelId, messageInput.trim());
    setMessageInput('');
  }, [selectedChannelId, messageInput, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleStartVideoCall = useCallback(() => {
    setIsVideoCallActive(true);
    // In a real app, this would initialize WebRTC connection
    console.log('Starting video call...');
  }, []);

  const handleEndVideoCall = useCallback(() => {
    setIsVideoCallActive(false);
    setIsScreenSharing(false);
    setIsMuted(false);
    setIsVideoEnabled(true);
    console.log('Ending video call...');
  }, []);

  const handleToggleScreenShare = useCallback(() => {
    setIsScreenSharing(!isScreenSharing);
    // In a real app, this would use Screen Capture API
    console.log('Screen sharing:', !isScreenSharing);
  }, [isScreenSharing]);

  const handleCreateChannel = useCallback(async () => {
    if (!currentWorkspace) return;

    const newChannel = await createChannel({
      name: 'New Channel',
      workspaceId: currentWorkspace.id,
      type: 'public',
      memberIds: [],
      createdBy: 'current-user-id',
      settings: {
        allowFiles: true,
        allowMentions: true,
        isArchived: false
      }
    });

    if (newChannel) {
      setSelectedChannelId(newChannel.id);
    }
  }, [currentWorkspace, createChannel]);

  const handleAddReaction = useCallback(async (messageId: string, emoji: string) => {
    await addReaction(messageId, emoji);
  }, [addReaction]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getParticipantColor = (userId: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold">Collaboration</h1>
          <p className="text-muted-foreground">
            Real-time collaboration and team communication
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "secondary"} className="gap-2">
            <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-500" : "bg-gray-500")} />
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          
          {activeSession && (
            <Button variant="outline" onClick={handleLeaveSession}>
              Leave Session
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Channels and Sessions */}
        <div className={cn(
          "border-r bg-card/30 backdrop-blur-sm",
          isMobile ? "w-full" : "w-80"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="flex-1 p-2 space-y-2">
              {/* Active Sessions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Active Sessions</h3>
                  <Button size="sm" variant="ghost" onClick={() => handleStartSession('new-doc', 'note')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {sessions.filter(s => !s.endedAt).map(session => (
                  <Card 
                    key={session.id} 
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:bg-accent/50",
                      session.id === activeSessionId && "ring-2 ring-primary"
                    )}
                    onClick={() => handleJoinSession(session.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{session.documentType}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(session.startedAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {session.participants.slice(0, 3).map(participant => (
                            <Avatar key={participant.userId} className="w-6 h-6 border-2 border-background">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className="text-xs">
                                {participant.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {session.participants.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{session.participants.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {session.participants.filter(p => p.isActive).length} active
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Online Team Members */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Team Members</h3>
                {teamMembers.filter(m => m.status === 'active').map(member => (
                  <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.title || member.role}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="channels" className="flex-1 p-2 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Channels</h3>
                <Button size="sm" variant="ghost" onClick={handleCreateChannel}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {channels.map(channel => (
                <div
                  key={channel.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                    selectedChannelId === channel.id ? "bg-accent" : "hover:bg-accent/50"
                  )}
                  onClick={() => setSelectedChannelId(channel.id)}
                >
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{channel.name}</p>
                    {channel.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {channel.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {channel.type === 'private' && (
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {activeSession && (
            /* Collaboration Session View */
            <div className="flex-1 flex flex-col">
              {/* Session Header */}
              <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Live Collaboration Session</h2>
                    <p className="text-sm text-muted-foreground">
                      {activeSession.documentType} • {onlineParticipants.length} participant(s)
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={isVideoCallActive ? "default" : "outline"} 
                      size="sm"
                      onClick={isVideoCallActive ? handleEndVideoCall : handleStartVideoCall}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {isVideoCallActive ? "End Call" : "Start Call"}
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={handleToggleScreenShare}>
                      <ScreenShare className="w-4 h-4 mr-2" />
                      Share Screen
                    </Button>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-center gap-2 mt-3">
                  {onlineParticipants.map(participant => (
                    <div key={participant.userId} className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-xs">
                          {participant.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{participant.name}</span>
                      {participant.cursor && (
                        <div 
                          className={cn("w-3 h-3 rounded-full", getParticipantColor(participant.userId))}
                          title="Active cursor"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Call Interface */}
              {isVideoCallActive && (
                <div className="bg-gray-900 p-4">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={isMuted ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant={!isVideoEnabled ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    >
                      {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    
                    <Button variant="destructive" size="sm" onClick={handleEndVideoCall}>
                      End Call
                    </Button>
                  </div>
                </div>
              )}

              {/* Document Collaboration Area */}
              <div className="flex-1 p-4">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Real-time document editing would appear here
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {selectedChannel && !activeSession && (
            /* Channel Chat View */
            <div className="flex-1 flex flex-col">
              {/* Channel Header */}
              <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-muted-foreground" />
                    <h2 className="font-semibold">{selectedChannel.name}</h2>
                    <Badge variant="outline">
                      {selectedChannel.memberIds.length} members
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {selectedChannel.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedChannel.description}
                  </p>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {channelMessages.map((message, index) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{message.senderName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm mt-1">{message.content}</p>
                        
                        {message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {message.reactions.map(reaction => (
                              <Button
                                key={reaction.emoji}
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleAddReaction(message.id, reaction.emoji)}
                              >
                                {reaction.emoji} {reaction.count}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={messageInputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message #${selectedChannel.name}`}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!selectedChannel && !activeSession && (
            /* Welcome/Empty State */
            <div className="flex-1 flex items-center justify-center">
              <Card className="text-center p-8 max-w-md">
                <CardHeader>
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle>Welcome to Collaboration</CardTitle>
                  <CardDescription>
                    Select a channel to start messaging or join a live collaboration session.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleCreateChannel}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Channel
                    </Button>
                    <Button variant="outline" onClick={() => handleStartSession('new-doc', 'note')}>
                      <Edit className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

CollaborationView.displayName = 'CollaborationView';