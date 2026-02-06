import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CheckCircle, XCircle, Loader2, Clock, Music, Shield } from 'lucide-react';
import { useGetPendingSubmissions, useApproveSubmission, useRejectSubmission, useGetAllApprovedAudio, useGetAllArtistProfiles } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Variant_Studio_CreatorZone } from '../backend';

export default function AdminPanel() {
  const { identity } = useInternetIdentity();
  const { data: pendingSubmissions = [], isLoading: pendingLoading } = useGetPendingSubmissions();
  const { data: approvedAudio = [], isLoading: approvedLoading } = useGetAllApprovedAudio();
  const { data: artistProfiles = [], isLoading: artistsLoading } = useGetAllArtistProfiles();
  const approveMutation = useApproveSubmission();
  const rejectMutation = useRejectSubmission();

  const currentPrincipal = identity?.getPrincipal().toString();

  const handleApprove = async (submissionId: string, ownerPrincipal: string) => {
    if (currentPrincipal === ownerPrincipal) {
      toast.error('You cannot approve your own submission');
      return;
    }

    try {
      await approveMutation.mutateAsync(submissionId);
      toast.success('Submission approved!');
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

  const formatDuration = (durationMs: bigint) => {
    const seconds = Number(durationMs) / 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending" className="gap-2">
          <Clock className="h-4 w-4" />
          Pending ({pendingSubmissions.length})
        </TabsTrigger>
        <TabsTrigger value="approved" className="gap-2">
          <Music className="h-4 w-4" />
          Approved ({approvedAudio.length})
        </TabsTrigger>
        <TabsTrigger value="users" className="gap-2">
          <Shield className="h-4 w-4" />
          Users ({artistProfiles.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending Submissions</CardTitle>
            <CardDescription>Review and approve audio submissions from creators</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending submissions
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audio ID</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSubmissions.map((submission) => {
                    const isOwnSubmission = currentPrincipal === submission.ownerPrincipal.toString();
                    return (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.id}</TableCell>
                        <TableCell>{formatDuration(submission.duration)}</TableCell>
                        <TableCell>
                          <Badge variant={submission.uploadedFrom === Variant_Studio_CreatorZone.Studio ? 'default' : 'secondary'}>
                            {submission.uploadedFrom === Variant_Studio_CreatorZone.Studio ? 'Studio' : 'Creator Zone'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.isPremium ? (
                            <Badge variant="outline">Premium</Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {submission.ownerPrincipal.toString().slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(submission.id, submission.ownerPrincipal.toString())}
                            disabled={approveMutation.isPending || rejectMutation.isPending || isOwnSubmission}
                            className="gap-1"
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(submission.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="gap-1"
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="approved" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Approved Audio</CardTitle>
            <CardDescription>All approved audio content in the library</CardDescription>
          </CardHeader>
          <CardContent>
            {approvedLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : approvedAudio.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No approved audio yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audio ID</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedAudio.map((audio) => (
                    <TableRow key={audio.id}>
                      <TableCell className="font-medium">{audio.id}</TableCell>
                      <TableCell>{formatDuration(audio.duration)}</TableCell>
                      <TableCell>
                        <Badge variant={audio.uploadedFrom === Variant_Studio_CreatorZone.Studio ? 'default' : 'secondary'}>
                          {audio.uploadedFrom === Variant_Studio_CreatorZone.Studio ? 'Studio' : 'Creator Zone'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {audio.isPremium ? (
                          <Badge variant="outline">Premium</Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {audio.ownerPrincipal.toString().slice(0, 8)}...
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View all artists and subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            {artistsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : artistProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No artists or subscribers yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Subscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artistProfiles.map((profile, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{profile.displayName}</TableCell>
                      <TableCell>
                        <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile.subscription ? (
                          <Badge variant="outline">Subscribed</Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
