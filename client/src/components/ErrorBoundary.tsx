import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/Button';

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors below this boundary and shows a fallback
 * instead of a blank white screen. Provides a Reload action; preserving
 * route state across the reload isn't necessary for this internal tool.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto mt-12 max-w-md space-y-3 rounded-lg border border-[var(--color-border)] bg-white p-6 text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-[var(--color-muted)]">{this.state.error.message}</p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );
  }
}
