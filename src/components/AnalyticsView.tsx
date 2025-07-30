import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AnalyticsView() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Productivity analytics will be shown here.</p>
        </CardContent>
      </Card>
    </div>
  );
}