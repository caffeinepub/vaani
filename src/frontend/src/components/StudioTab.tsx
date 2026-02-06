import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Headphones, Clock, Crown } from 'lucide-react';
import { useGetAllApprovedAudio } from '../hooks/useQueries';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

export default function StudioTab() {
  const { data: approvedAudio, isLoading } = useGetAllApprovedAudio();

  const formatDuration = (ms: bigint) => {
    const seconds = Number(ms) / 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🟢 VAANI Studio</CardTitle>
        <CardDescription>
          Premium, high-quality audio content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : approvedAudio && approvedAudio.length > 0 ? (
          <div className="space-y-3">
            {approvedAudio.map((audio) => (
              <div
                key={audio.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Audio #{audio.id}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDuration(audio.duration)}
                      </div>
                      {audio.isPremium && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {audio.uploadedFrom === 'Studio' ? '🟢 Studio' : '🔵 Creator'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Audio Available</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No approved audio content yet. Check back soon for premium audio from creators.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
