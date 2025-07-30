import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, MoreVertical } from '@phosphor-icons/react';

interface MobileListItem {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'task' | 'folder';
  status?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isStarred?: boolean;
}

interface MobileOptimizedListProps {
  items: MobileListItem[];
  onItemSelect: (item: MobileListItem) => void;
  onItemUpdate: (id: string, updates: Partial<MobileListItem>) => void;
  onItemDelete: (id: string) => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export function MobileOptimizedList({
  items,
  onItemSelect,
  onItemUpdate,
  onItemDelete,
  hasMore = false,
  isLoading = false,
  onLoadMore
}: MobileOptimizedListProps) {
  
  const handleSwipeAction = (item: MobileListItem, action: 'star' | 'delete') => {
    if (action === 'star') {
      onItemUpdate(item.id, { isStarred: !item.isStarred });
    } else if (action === 'delete') {
      onItemDelete(item.id);
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card 
            className="cursor-pointer active:scale-[0.98] transition-transform mobile-touch"
            onClick={() => onItemSelect(item)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {item.content}
                  </p>
                  
                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    {item.type && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.type}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwipeAction(item, 'star');
                    }}
                  >
                    <Star 
                      size={14} 
                      className={item.isStarred ? 'fill-yellow-400 text-yellow-400' : ''} 
                    />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could open a menu with more options
                    }}
                  >
                    <MoreVertical size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
      
      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center p-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
      
      {/* Empty State */}
      {items.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No items found</p>
        </Card>
      )}
    </div>
  );
}