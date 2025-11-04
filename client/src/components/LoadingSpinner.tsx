import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingSpinner({ fullScreen = false, message }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loading-spinner" />
          {message ? (
            <p className="text-lg text-muted-foreground animate-pulse">{message}</p>
          ) : (
            <span className="sr-only">Loading...</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center p-8"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" />
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : (
          <span className="sr-only">Loading...</span>
        )}
      </div>
    </div>
  );
}
