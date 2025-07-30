import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SearchView() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Search functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SearchView;