import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TimelineView() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Project timeline view will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}