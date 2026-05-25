import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardValue, CardContent } from './components/ui/Card';

export const App = () => {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Salary Management</h1>
        <p className="text-sm text-[var(--color-muted)]">
          UI scaffold — features land in subsequent commits.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardValue>Ready</CardValue>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted)]">
            Tailwind v4 + handwritten UI primitives are wired up. The next commit adds
            routing, data fetching, and the API client.
          </p>
          <div className="mt-4 flex gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};
