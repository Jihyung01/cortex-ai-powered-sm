import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AIAssistantView() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">AI-powered assistance will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}