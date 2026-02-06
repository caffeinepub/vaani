import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Profile, UserRole, AudioMetadata, AudioSubmissionInput } from '../backend';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString();

  const query = useQuery<Profile | null>({
    queryKey: ['currentUserProfile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!principalId,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!principalId && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString();

  return useMutation({
    mutationFn: async ({ displayName, subscription }: { displayName: string; subscription: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(displayName, subscription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalId] });
      queryClient.invalidateQueries({ queryKey: ['currentUserRole', principalId] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin', principalId] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && !!principalId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!principalId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useGetAllArtistProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile[]>({
    queryKey: ['artistProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllArtistProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistProfiles'] });
    },
  });
}

// Audio Metadata Queries

export function useSubmitAudioForApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AudioSubmissionInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitAudioForApproval(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingSubmissions'] });
    },
  });
}

export function useGetPendingSubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AudioMetadata[]>({
    queryKey: ['pendingSubmissions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingSubmissions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useApproveSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveSubmission(submissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['approvedAudio'] });
    },
  });
}

export function useRejectSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectSubmission(submissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingSubmissions'] });
    },
  });
}

export function useGetAllApprovedAudio() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AudioMetadata[]>({
    queryKey: ['approvedAudio'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllApprovedAudio();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Minimal WhoAmI Query
export function useWhoAmI() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString();

  return useQuery<string>({
    queryKey: ['whoAmI', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.whoAmI();
    },
    enabled: !!actor && !actorFetching && !!principalId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
