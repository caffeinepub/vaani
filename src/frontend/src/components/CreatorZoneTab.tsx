import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Mic, Plus, Loader2, X } from 'lucide-react';
import { useSubmitAudioForApproval } from '../hooks/useQueries';
import { Variant_Studio_CreatorZone } from '../backend';
import { toast } from 'sonner';
import CreatorZoneAuthControls from './CreatorZoneAuthControls';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';

export default function CreatorZoneTab() {
  const [audioId, setAudioId] = useState('');
  const [duration, setDuration] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const submitMutation = useSubmitAudioForApproval();
  const { autoLogoutReason, dismissIdleNotice } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioId.trim()) {
      toast.error('Please enter an audio ID');
      return;
    }

    const durationMs = parseInt(duration) * 1000;
    if (isNaN(durationMs) || durationMs <= 0) {
      toast.error('Please enter a valid duration in seconds');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        id: audioId.trim(),
        uploadedFrom: Variant_Studio_CreatorZone.CreatorZone,
        duration: BigInt(durationMs),
        isPremium,
      });

      toast.success('Audio submitted for approval!');
      setAudioId('');
      setDuration('');
      setIsPremium(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit audio');
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="space-y-1 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-semibold">🔵 Creator Zone</CardTitle>
            <CardDescription className="text-sm text-muted-foreground/70">
              Submit audio metadata for admin approval
            </CardDescription>
          </div>
          <CreatorZoneAuthControls />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {autoLogoutReason === 'idle' && (
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm text-amber-900 dark:text-amber-200">
                You were logged out due to inactivity.
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissIdleNotice}
                className="h-6 w-6 p-0 hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="audioId" className="text-sm font-medium">Audio ID</Label>
            <Input
              id="audioId"
              placeholder="e.g., audio-001"
              value={audioId}
              onChange={(e) => setAudioId(e.target.value)}
              disabled={submitMutation.isPending}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="e.g., 180"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={submitMutation.isPending}
              className="h-10"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="premium" className="text-sm font-medium">Premium Content</Label>
              <p className="text-xs text-muted-foreground/70">
                Mark this audio as premium content
              </p>
            </div>
            <Switch
              id="premium"
              checked={isPremium}
              onCheckedChange={setIsPremium}
              disabled={submitMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full gap-2 h-10"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Submitting...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Submit for Approval</span>
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-dashed border-border/50 bg-muted/20 p-6 text-center">
          <Mic className="h-8 w-8 mx-auto mb-3 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            Audio recording and file upload features coming soon. For now, submit metadata only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
