import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, Users, CheckCircle, XCircle, Clock, Crown, Loader2 } from 'lucide-react';
import { useGetAllArtistProfiles, useGetPendingSubmissions, useApproveSubmission, useRejectSubmission } from '../hooks/useQueries';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function AdminPanel() {
  const { data: artistProfiles, isLoading: artistsLoading } = useGetAllArtistProfiles();
  const { data: pendingSubmissions, isLoading: pendingLoading } = useGetPendingSubmissions();
  const approveMutation = useApproveSubmission();
  const rejectMutation = useRejectSubmission();
  const { identity } = useInternetIdentity();

  const formatDuration = (ms: bigint) => {
    const seconds = Number(ms) / 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleApprove = async (submissionId: string, ownerPrincipal: string) => {
    if (identity && identity.getPrincipal().toString() === ownerPrincipal) {
      toast.error('You cannot approve your own submission');
      return;
    }

    try {
      await approveMutation.mutateAsync(submissionId);
      toast.success('Submission approved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve submission');
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      await rejectMutation.mutateAsync(submissionId);
      toast.success('Submission rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject submission');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>VAANI Studio - Admin Panel</CardTitle>
        </div>
        <CardDescription>
          Manage content submissions and platform users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submissions" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending Submissions
              {pendingSubmissions && pendingSubmissions.length > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
                  {pendingSubmissions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-4 mt-4">
            {pendingLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : pendingSubmissions && pendingSubmissions.length > 0 ? (
              <div className="space-y-3">
                {pendingSubmissions.map((submission) => {
                  const isOwnSubmission = identity && identity.getPrincipal().toString() === submission.ownerPrincipal.toString();
                  
                  return (
                    <div
                      key={submission.id}
                      className="p-4 rounded-lg border border-border bg-card space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Audio #{submission.id}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDuration(submission.duration)}
                            </div>
                            {submission.isPremium && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Crown className="h-3 w-3" />
                                Premium
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {submission.uploadedFrom === 'Studio' ? '🟢 Studio' : '🔵 Creator'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            Owner: {submission.ownerPrincipal.toString().slice(0, 20)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 gap-2"
                          onClick={() => handleApprove(submission.id, submission.ownerPrincipal.toString())}
                          disabled={approveMutation.isPending || rejectMutation.isPending || isOwnSubmission}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 gap-2"
                          onClick={() => handleReject(submission.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          {rejectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Reject
                        </Button>
                      </div>

                      {isOwnSubmission && (
                        <p className="text-xs text-amber-600 dark:text-amber-500">
                          ⚠️ You cannot approve your own submission
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Pending Submissions</h3>
                <p className="text-sm text-muted-foreground">
                  All submissions have been reviewed
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-4">
            {artistsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : artistProfiles && artistProfiles.length > 0 ? (
              <div className="space-y-2">
                {artistProfiles.map((profile, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                  >
                    <div>
                      <p className="font-medium text-sm">{profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.role === 'admin' ? 'Administrator' : 'Artist'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {profile.role === 'admin' && (
                        <Badge variant="default" className="text-xs">
                          Admin
                        </Badge>
                      )}
                      {profile.subscription && (
                        <Badge variant="secondary" className="text-xs">
                          Subscribed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No artists or admins found
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
