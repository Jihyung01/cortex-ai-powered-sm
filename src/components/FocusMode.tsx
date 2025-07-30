import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FocusMode() {
  return (
    <div className="h-screen flex items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Focus Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Distraction-free focus environment.</p>
        </CardContent>
      </Card>
    </div>
  );
}