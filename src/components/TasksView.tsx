import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TasksView() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Task management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default TasksView;