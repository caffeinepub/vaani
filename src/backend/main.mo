import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile type
  public type Profile = {
    displayName : Text;
    role : AccessControl.UserRole;
    subscription : Bool;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      switch (Text.compare(profile1.displayName, profile2.displayName)) {
        case (#equal) { #less };
        case (order) { order };
      };
    };
  };

  // Simulate persistent (stable) state for profiles using Map data structure
  let profiles = Map.empty<Principal, Profile>();

  // Audio Metadata type
  public type AudioMetadata = {
    id : Text;
    ownerPrincipal : Principal;
    uploadedFrom : { #Studio; #CreatorZone };
    duration : Nat; // Duration in milliseconds
    isApproved : Bool;
    isPremium : Bool;
  };

  // Audio submission input type (without ownerPrincipal to prevent spoofing)
  public type AudioSubmissionInput = {
    id : Text;
    uploadedFrom : { #Studio; #CreatorZone };
    duration : Nat;
    isPremium : Bool;
  };

  let audios = Map.empty<Text, AudioMetadata>();

  // -- Profile Management (Required by frontend) -- //

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(displayName : Text, subscription : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let role = AccessControl.getUserRole(accessControlState, caller);
    let profile : Profile = {
      displayName;
      role;
      subscription;
    };
    profiles.add(caller, profile);
  };

  // -- Additional Profile Queries -- //

  public query ({ caller }) func getProfileByPrincipal(principal : Principal) : async Profile {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (profiles.get(principal)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User " # principal.toText() # " does not exist") };
    };
  };

  public query ({ caller }) func getAllArtistProfiles() : async [Profile] {
    // Public read access - no authorization needed
    let allProfiles = profiles.values().toArray();
    let artistProfiles = allProfiles.filter(func(p) {
      p.role == #admin or p.subscription;
    });
    artistProfiles.sort<Profile>();
  };

  public query ({ caller }) func searchArtists(search : Text) : async [(Principal, Profile)] {
    // Public read access - no authorization needed
    let allEntries = profiles.entries().toArray();
    allEntries.filter<(Principal, Profile)>(func((_, p)) {
      (p.role == #admin or p.subscription) and p.displayName.contains(#text search);
    });
  };

  // -- Creator Zone Submission Flow -- //

  public shared ({ caller }) func submitAudioForApproval(input : AudioSubmissionInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit audio");
    };

    // Security: Set ownerPrincipal to caller to prevent principal spoofing
    let metadata : AudioMetadata = {
      id = input.id;
      ownerPrincipal = caller;
      uploadedFrom = input.uploadedFrom;
      duration = input.duration;
      isApproved = false;
      isPremium = input.isPremium;
    };

    audios.add(input.id, metadata);
  };

  // -- VAANI Studio Admin Operations -- //

  public query ({ caller }) func getPendingSubmissions() : async [AudioMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending submissions");
    };

    let allAudios = audios.values().toArray();
    allAudios.filter(func(a) { not a.isApproved });
  };

  public shared ({ caller }) func approveSubmission(submissionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve submissions");
    };

    let submission = switch (audios.get(submissionId)) {
      case (null) { Runtime.trap("Submission " # submissionId # " does not exist") };
      case (?submission) { submission };
    };

    if (caller == submission.ownerPrincipal) {
      Runtime.trap("You cannot self-approve your own submission");
    };

    let approvedSubmission = { submission with isApproved = true };
    audios.add(submissionId, approvedSubmission);
  };

  public shared ({ caller }) func rejectSubmission(submissionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject submissions");
    };

    switch (audios.get(submissionId)) {
      case (null) { Runtime.trap("Submission " # submissionId # " does not exist") };
      case (_) { audios.remove(submissionId) };
    };
  };

  // -- Public Audio Queries -- //

  public query ({ caller }) func getApprovedAudio(audioId : Text) : async AudioMetadata {
    switch (audios.get(audioId)) {
      case (null) { Runtime.trap("Audio " # audioId # " does not exist") };
      case (?audio) {
        if (not audio.isApproved) {
          Runtime.trap("Audio " # audioId # " is not yet approved");
        };
        audio;
      };
    };
  };

  public query ({ caller }) func getAllApprovedAudio() : async [AudioMetadata] {
    let allAudios = audios.values().toArray();
    allAudios.filter(func(a) { a.isApproved });
  };

  // -- Access Control Queries -- //

  public query ({ caller }) func checkIsArtist() : async Bool {
    switch (profiles.get(caller)) {
      case (?profile) { profile.role == #admin or profile.subscription };
      case (null) { false };
    };
  };
};
