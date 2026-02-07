import { AlertCircle } from 'lucide-react';

export default function TestingModeBanner() {
  return (
    <div className="sticky top-0 z-[60] w-full bg-amber-500/90 backdrop-blur supports-[backdrop-filter]:bg-amber-500/80 border-b border-amber-600">
      <div className="container flex h-10 items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-950">
          <AlertCircle className="h-4 w-4" />
          <span>This app is in testing mode</span>
        </div>
      </div>
    </div>
  );
}
