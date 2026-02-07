import { Loader2 } from 'lucide-react';

interface FullScreenLoadingProps {
  message?: string;
}

export default function FullScreenLoading({ message = 'Loading...' }: FullScreenLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
