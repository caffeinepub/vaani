import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Profile {
    principal: Principal;
    displayName: string;
    subscription: boolean;
    role: UserRole;
}
export interface AudioMetadata {
    id: string;
    isApproved: boolean;
    uploadedFrom: Variant_Studio_CreatorZone;
    duration: bigint;
    isPremium: boolean;
    ownerPrincipal: Principal;
}
export interface AudioSubmissionInput {
    id: string;
    uploadedFrom: Variant_Studio_CreatorZone;
    duration: bigint;
    isPremium: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_Studio_CreatorZone {
    Studio = "Studio",
    CreatorZone = "CreatorZone"
}
export interface backendInterface {
    approveSubmission(submissionId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkIsArtist(): Promise<boolean>;
    getAllApprovedAudio(): Promise<Array<AudioMetadata>>;
    getAllArtistProfiles(): Promise<Array<Profile>>;
    getApprovedAudio(audioId: string): Promise<AudioMetadata>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPendingSubmissions(): Promise<Array<AudioMetadata>>;
    getProfileByPrincipal(principal: Principal): Promise<Profile>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectSubmission(submissionId: string): Promise<void>;
    saveCallerUserProfile(displayName: string, subscription: boolean): Promise<void>;
    searchArtists(search: string): Promise<Array<Profile>>;
    submitAudioForApproval(input: AudioSubmissionInput): Promise<void>;
    whoAmI(): Promise<string>;
}
