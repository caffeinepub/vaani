import { SiCaffeine } from 'react-icons/si';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            © 2026. Built with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
            >
              <SiCaffeine className="h-3.5 w-3.5" />
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
