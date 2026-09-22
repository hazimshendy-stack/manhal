# Firestore Rules — v7

## Hierarchy (top → bottom)

- **HEAD** — Head of Sub-Branches. Site Admin. Top leader.
- **VICE** — Vice Head(s) of Sub-Branches. Full permissions except admin-only actions.
- **HEAD_HR_GLOBAL** — Head of HRs. Oversees all HRs and all members.
- **PRESIDENT** — Head of a single team. Scope: own team only.
- **VICE_PRESIDENT** — Vice Head of a single team. Scope: own team only.
- **HR** — HR of a single team. Reports to Head of HRs. Scope: own team only.
- **COMMITTEE_HR** — HR of a committee. Scope: own committee only.
- **MEMBER / VIEWER** — regular members.

## Key rules

- Team leadership (PRESIDENT / VICE_PRESIDENT / HR) may only act on their **own team**.
- Committee HR may only act on their **own committee** and its members.
- Only HEAD is admin. VICE cannot perform admin-only actions.
- Strict routing: notifications target ONE recipient (or an explicit group).

## Publish

Firebase Console → Firestore Database → Rules → paste → Publish.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function userDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function userExists() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    // HEAD only — admin.
    function isAdmin() {
      return isSignedIn() && userExists() && userDoc().role == 'HEAD';
    }

    // HEAD or VICE — full org-wide permissions.
    function isHeadOrVice() {
      return isSignedIn() && userExists()
        && userDoc().role in ['HEAD', 'VICE'];
    }

    function isGlobalHR() {
      return isSignedIn() && userExists() && userDoc().role == 'HEAD_HR_GLOBAL';
    }

    function isTeamHead() {
      return isSignedIn() && userExists() && userDoc().role == 'PRESIDENT';
    }

    function isTeamViceHead() {
      return isSignedIn() && userExists() && userDoc().role == 'VICE_PRESIDENT';
    }

    function isTeamHR() {
      return isSignedIn() && userExists() && userDoc().role == 'HR';
    }

    function isCommitteeHR() {
      return isSignedIn() && userExists() && userDoc().role == 'COMMITTEE_HR';
    }

    // SAME-TEAM checks — leadership only manages their own team.
    function sameTeamAs(targetTeamId) {
      return isSignedIn() && userExists()
        && userDoc().teamId == targetTeamId;
    }

    function isCommitteeHRFor(committeeId) {
      return isCommitteeHR()
        && userDoc().committeeIds is list
        && committeeId in userDoc().committeeIds;
    }

    // ═══════════ USERS ═══════════
    match /users/{uid} {
      allow read: if isSignedIn();
      allow create: if request.auth.uid == uid;
      allow update: if isAdmin() || request.auth.uid == uid;
      allow delete: if isAdmin();
    }

    // ═══════════ MEMBERS ═══════════
    match /members/{id} {
      allow read: if isSignedIn();
      allow create: if isAdmin() || (
        isSignedIn()
        && request.resource.data.linkedUserId == request.auth.uid
      );
      allow update: if isAdmin()
        || (isTeamHead() && userDoc().teamId in resource.data.teamIds)
        || (isTeamViceHead() && userDoc().teamId in resource.data.teamIds)
        || (isTeamHR() && userDoc().teamId in resource.data.teamIds)
        || isGlobalHR();
      allow delete: if isAdmin();
    }

    // ═══════════ TEAMS ═══════════
    match /teams/{id} {
      allow read: if true;
      allow write: if isHeadOrVice();
    }

    // ═══════════ COMMITTEES ═══════════
    match /committees/{id} {
      allow read: if isSignedIn();
      allow write: if isHeadOrVice();
    }

    // ═══════════ CONTRIBUTIONS ═══════════
    match /contributions/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.resource.data.createdBy == request.auth.uid;
      allow update: if isAdmin()
        || isCommitteeHRFor(resource.data.committeeId)
        || (isTeamHR() && userDoc().teamId == resource.data.teamId);
      allow delete: if isAdmin()
        || isGlobalHR()
        || (isTeamHead() && userDoc().teamId == resource.data.teamId)
        || (isTeamViceHead() && userDoc().teamId == resource.data.teamId);
    }

    // ═══════════ WARNINGS ═══════════
    match /warnings/{id} {
      allow read: if isSignedIn();
      allow write: if isAdmin()
        || isGlobalHR()
        || (isTeamHead() && userDoc().teamId in resource.data.teamIds);
    }

    // ═══════════ ACHIEVEMENTS ═══════════
    match /achievements/{id} {
      allow read: if true;
      allow write: if isHeadOrVice() || isGlobalHR();
    }

    // ═══════════ NOTIFICATIONS ═══════════
    // Strict: user can only read their own notifications.
    match /notifications/{id} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn();
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if isAdmin();
    }

    // ═══════════ CONVERSATIONS ═══════════
    match /conversations/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isAdmin();
    }

    // ═══════════ MESSAGES ═══════════
    match /messages/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.senderUid == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // ═══════════ CALENDAR ═══════════
    match /calendar/{id} {
      allow read: if true;
      allow write: if isHeadOrVice() || isGlobalHR();
    }

    // ═══════════ GOVERNANCE ═══════════
    match /governance/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ═══════════ AUDIT ═══════════
    match /audit/{id} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
    }

    // ═══════════ REQUESTS ═══════════
    // Single-approver: only the Head of the requester's team decides.
    match /requests/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.resource.data.requesterUid == request.auth.uid;
      allow update: if isAdmin()
        || (isTeamHead() && userDoc().teamId in [
          resource.data.fromTeamId,
          resource.data.toTeamId
        ]);
      allow delete: if isAdmin();
    }

    // ═══════════ APPROVALS ═══════════
    match /approvals/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isAdmin()
        || isTeamHead()
        || isGlobalHR();
    }
  }
}
```
