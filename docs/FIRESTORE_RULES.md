# Firestore Rules v5.1

   ## الخطوات
   1. Firebase Console → Firestore Database → Rules
   2. امسح كل شيء والصق المحتوى بالأسفل
   3. اضغط Publish

   ## القواعد

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       function isSignedIn() {
         return request.auth != null;
       }

       function userData() {
         return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
       }

       function userDocExists() {
         return exists(/databases/$(database)/documents/users/$(request.auth.uid));
       }

       function isAdmin() {
         return isSignedIn()
           && userDocExists()
           && userData().role in ['HEAD', 'VICE'];
       }

       function isManager() {
         return isSignedIn()
           && userDocExists()
           && userData().role in ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'];
       }

       function sameTeam() {
         return isSignedIn()
           && userDocExists()
           && resource.data.teamId == userData().teamId;
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
         allow create: if isSignedIn() && (
           request.resource.data.linkedUserId == request.auth.uid
           || isAdmin()
         );
         allow update: if isAdmin() || (
           isManager()
           && userData().teamId in resource.data.teamIds
         );
         allow delete: if isAdmin();
       }

       // ═══════════ TEAMS ═══════════
       match /teams/{id} {
         allow read: if isSignedIn();
         allow write: if isAdmin();
       }

       // ═══════════ COMMITTEES ═══════════
       match /committees/{id} {
         allow read: if isSignedIn();
         allow write: if isAdmin();
       }

       // ═══════════ CONTRIBUTIONS ═══════════
       match /contributions/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && (
           request.resource.data.createdBy == request.auth.uid
           || isManager()
         );
         allow update: if isManager();
         allow delete: if isAdmin();
       }

       // ═══════════ WARNINGS ═══════════
       match /warnings/{id} {
         allow read: if isManager() || (
           isSignedIn()
           && resource.data.memberId == userData().memberId
         );
         allow write: if isAdmin() || (
           isManager()
           && userData().teamId in get(/databases/$(database)/documents/members/$(request.resource.data.memberId)).data.teamIds
         );
       }

       // ═══════════ ACHIEVEMENTS ═══════════
       match /achievements/{id} {
         allow read: if true;
         allow write: if isManager();
       }

       // ═══════════ NOTIFICATIONS ═══════════
       match /notifications/{id} {
         allow read: if isSignedIn() && (
           resource.data.userId == request.auth.uid
           || isManager()
         );
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
         allow write: if isManager();
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
       match /requests/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && (
           request.resource.data.requesterUid == request.auth.uid
           || isManager()
         );
         allow update: if isManager();
         allow delete: if isAdmin();
       }

       // ═══════════ APPROVALS ═══════════
       match /approvals/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn();
         allow update, delete: if isManager();
       }
     }
   }
   ```
   