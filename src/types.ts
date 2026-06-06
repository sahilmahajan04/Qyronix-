/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Candidate' | 'Recruiter' | 'Admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO String format or Firestore timestamp representation
}

export type ViewType = 'landing' | 'login' | 'signup' | 'forgot-password' | 'verify-email' | 'dashboard';

export interface FirebaseConfigType {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId: string;
}
