import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CalendarView() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Calendar integration will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}