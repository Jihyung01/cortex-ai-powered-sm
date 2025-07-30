import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function KanbanView() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Kanban Board</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Kanban task organization will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}