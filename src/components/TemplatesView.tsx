import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TemplatesView() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Note templates will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}