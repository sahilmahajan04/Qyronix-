/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromServer, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  firebaseConnectionError: string | null;
  signUpEmail: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: (chosenRole?: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseConnectionError, setFirebaseConnectionError] = useState<string | null>(null);

  // 1. Boot-time connection validation constraint
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setFirebaseConnectionError(null);
      } catch (error: any) {
        console.error("Firebase connection test result:", error);
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. Client appears to be offline.");
          setFirebaseConnectionError("Client appears to be offline. Make sure you have created/enabled a Firestore Database in your qyronix2 project.");
        } else {
          setFirebaseConnectionError(error?.message || "Failed to establish a cloud connection to your Firestore database.");
        }
      }
    }
    testConnection();
  }, []);

  // Fetch or sync user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const path = `users/${uid}`;
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        return userSnapshot.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchUserProfile(user.uid);
    if (profile) {
      setUserProfile(profile);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await fetchUserProfile(currentUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email and Password Sign up
  const signUpEmail = async (email: string, password: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      // Firestore upload parameters
      const newUserProfile: UserProfile = {
        uid: createdUser.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      };

      const path = `users/${createdUser.uid}`;
      try {
        await setDoc(doc(db, 'users', createdUser.uid), {
          ...newUserProfile,
          createdAt: serverTimestamp() // Firestore Rule requires timestamp format, which matches request.time!
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }

      setUserProfile(newUserProfile);
      
      // Dispatch verification email automatically
      await sendEmailVerification(createdUser);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email and Password Sign in
  const signInEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      let profile = await fetchUserProfile(userCredential.user.uid);
      
      // Safety: auto-create profile if missing for any reason
      if (!profile) {
        const isDemo = ['candidate@qyronix.io', 'recruiter@qyronix.io', 'admin@qyronix.io'].includes(email.toLowerCase());
        const resolvedRole: UserRole = email.toLowerCase().includes('recruiter') ? 'Recruiter' : email.toLowerCase().includes('admin') ? 'Admin' : 'Candidate';
        const resolvedName = email.toLowerCase().includes('recruiter') ? 'Demo Recruiter' : email.toLowerCase().includes('admin') ? 'Demo System Admin' : 'Demo Candidate';
        
        profile = {
          uid: userCredential.user.uid,
          name: resolvedName,
          email: email,
          role: resolvedRole,
          createdAt: new Date().toISOString()
        };
        const path = `users/${userCredential.user.uid}`;
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            ...profile,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      setUserProfile(profile);
      
      const isDemo = ['candidate@qyronix.io', 'recruiter@qyronix.io', 'admin@qyronix.io'].includes(email.toLowerCase());
      if (isDemo) {
        localStorage.setItem('qyronix_bypass_verify', 'true');
      }
    } catch (error: any) {
      const isDemo = ['candidate@qyronix.io', 'recruiter@qyronix.io', 'admin@qyronix.io'].includes(email.toLowerCase());
      if (isDemo) {
        try {
          const resolvedRole: UserRole = email.toLowerCase().includes('recruiter') ? 'Recruiter' : email.toLowerCase().includes('admin') ? 'Admin' : 'Candidate';
          const resolvedName = email.toLowerCase().includes('recruiter') ? 'Demo Recruiter' : email.toLowerCase().includes('admin') ? 'Demo System Admin' : 'Demo Candidate';
          
          await signUpEmail(email, password, resolvedName, resolvedRole);
          localStorage.setItem('qyronix_bypass_verify', 'true');
          return;
        } catch (signUpErr) {
          console.error("Auto-registration of demo user failed:", signUpErr);
        }
      }
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google Authentication Popup
  const signInGoogle = async (chosenRole: UserRole = 'Candidate') => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const authenticatedUser = userCredential.user;

      let profile = await fetchUserProfile(authenticatedUser.uid);
      
      // Auto-register profile if it doesn't already exist in Firestore
      if (!profile) {
        const path = `users/${authenticatedUser.uid}`;
        profile = {
          uid: authenticatedUser.uid,
          name: authenticatedUser.displayName || 'Google User',
          email: authenticatedUser.email || '',
          role: chosenRole,
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'users', authenticatedUser.uid), {
            ...profile,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }
      
      setUserProfile(profile);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset Password link
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Resend Email Verification
  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('No user currently authenticated to dispatch verification to.');
    }
  };

  // Logout Session
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('qyronix_bypass_verify');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      firebaseConnectionError,
      signUpEmail,
      signInEmail,
      signInGoogle,
      resetPassword,
      resendVerification,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be called inside an AuthProvider scope');
  }
  return context;
}
