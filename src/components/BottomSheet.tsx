import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMobileGestures } from '@/hooks/use-mobile-gestures';
import { useNativeFeatures } from '@/hooks/use-native-features';
import { useOffline } from '@/hooks/use-offline';
import { useIsMobile } from '@/hooks/use-mobile';
import { springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { 
  X, 
  Check,
  Camera,
  Microphone,
  Image,
  MapPin,
  Share,
  Save,
  Loader2,
  Upload,
  FileText
} from '@phosphor-icons/react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxHeight?: string;
  dismissOnBackdrop?: boolean;
}

export const BottomSheet = memo<BottomSheetProps>(({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxHeight = '80vh',
  dismissOnBackdrop = true
}) => {
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const sheetHeight = useRef(0);

  const { elementRef } = useMobileGestures({
    onSwipe: (gesture) => {
      if (gesture.direction === 'down' && gesture.distance > 100) {
        onClose();
      }
    }
  });

  // Handle drag to dismiss
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    dragStartY.current = touch.clientY;
    sheetHeight.current = sheetRef.current?.offsetHeight || 0;
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    
    const touch = e.touches[0];
    const deltaY = Math.max(0, touch.clientY - dragStartY.current);
    setDragY(deltaY);
  }, [isDragging, isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Close if dragged down more than 1/3 of sheet height
    if (dragY > sheetHeight.current / 3) {
      onClose();
    } else {
      setDragY(0);
    }
  }, [isDragging, dragY, onClose]);

  // Reset drag state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  if (!isMobile) {
    // Desktop: render as dialog
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={dismissOnBackdrop ? onClose : undefined}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={springPresets.gentle}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden glass-elevated">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="overflow-auto max-h-[60vh]">
                  {children}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Mobile: render as bottom sheet
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={dismissOnBackdrop ? onClose : undefined}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ 
              y: isDragging ? dragY : 0
            }}
            exit={{ y: '100%' }}
            transition={isDragging ? { duration: 0 } : springPresets.gentle}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ maxHeight }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Card className="h-full rounded-t-3xl rounded-b-none glass-elevated border-t border-x border-b-0">
              {/* Drag Handle */}
              <div className="flex justify-center py-3" ref={elementRef}>
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="overflow-auto flex-1 px-4 pb-4">
                {children}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

BottomSheet.displayName = 'BottomSheet';

// Quick Note Creation Component
interface QuickNoteProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: { title: string; content: string; tags: string[]; attachments: File[] }) => void;
}

export const QuickNoteCreator = memo<QuickNoteProps>(({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  
  const { 
    captureImage, 
    openFilePicker, 
    getCurrentLocation, 
    shareContent, 
    vibrate 
  } = useNativeFeatures();
  const { queueAction, isOnline } = useOffline();

  // Clear form when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setTags([]);
      setAttachments([]);
      setCurrentLocation(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    
    setIsSaving(true);
    vibrate(50);
    
    try {
      const noteData = {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        tags,
        attachments
      };
      
      if (isOnline) {
        await onSave(noteData);
      } else {
        queueAction('create-note', noteData);
        onSave(noteData); // Optimistic update
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save note:', error);
      vibrate([100, 50, 100]); // Error pattern
    } finally {
      setIsSaving(false);
    }
  };

  const handleCameraCapture = async () => {
    const imageData = await captureImage();
    if (imageData) {
      // Convert data URL to File
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setAttachments(prev => [...prev, file]);
      vibrate(30);
    }
  };

  const handleFileUpload = async () => {
    const files = await openFilePicker('image/*,application/pdf,.txt,.md', true);
    setAttachments(prev => [...prev, ...files]);
    if (files.length > 0) vibrate(30);
  };

  const handleLocationAdd = async () => {
    const position = await getCurrentLocation();
    if (position) {
      const { latitude, longitude } = position.coords;
      setCurrentLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      vibrate(30);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title || 'Quick Note',
      text: content,
      url: window.location.href
    };
    
    const shared = await shareContent(shareData);
    if (shared) {
      vibrate(50);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags(prev => [...prev, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Note"
      maxHeight="90vh"
    >
      <div className="space-y-4">
        {/* Title Input */}
        <Input
          placeholder="Note title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium"
        />
        
        {/* Content Input */}
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-32 resize-none"
          rows={4}
        />
        
        {/* Tags */}
        <div className="space-y-2">
          <Input
            placeholder="Add tags (press Enter)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Attachments:</p>
            <div className="space-y-1">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Location */}
        {currentLocation && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{currentLocation}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentLocation(null)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" onClick={handleCameraCapture}>
            <Camera className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleFileUpload}>
            <Upload className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleLocationAdd}>
            <MapPin className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Save Button */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={isSaving || (!title.trim() && !content.trim())}
            className="flex-1"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Note
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
});

QuickNoteCreator.displayName = 'QuickNoteCreator';