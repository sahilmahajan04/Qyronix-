/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type PermissionState = 'prompt' | 'granted' | 'denied';

export interface PermissionProfile {
  camera: PermissionState;
  microphone: PermissionState;
  notifications: PermissionState;
  location: PermissionState;
  files: PermissionState;
  clipboard: PermissionState;
}

interface PermissionContextProps {
  permissions: PermissionProfile;
  hasSeenWelcomeModal: boolean;
  setHasSeenWelcomeModal: (seen: boolean) => void;
  requestCamera: () => Promise<PermissionState>;
  requestMicrophone: () => Promise<PermissionState>;
  requestNotifications: () => Promise<PermissionState>;
  requestLocation: () => Promise<PermissionState>;
  requestFiles: () => Promise<PermissionState>;
  requestClipboard: () => Promise<PermissionState>;
  resetPermissions: () => void;
  syncAllPermissions: () => Promise<void>;
  isIframe: boolean;
}

const PermissionContext = createContext<PermissionContextProps | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [permissions, setPermissions] = useState<PermissionProfile>({
    camera: 'prompt',
    microphone: 'prompt',
    notifications: 'prompt',
    location: 'prompt',
    files: 'prompt',
    clipboard: 'prompt'
  });

  const [hasSeenWelcomeModal, setHasSeenWelcomeModalState] = useState<boolean>(false);
  const [isIframe, setIsIframe] = useState<boolean>(false);

  // Detect sandboxed iframe environment
  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);

  // Update localStorage helper
  const saveToLocalStorage = (newPerms: PermissionProfile) => {
    if (user) {
      localStorage.setItem(`perms_${user.uid}`, JSON.stringify(newPerms));
    } else {
      localStorage.setItem('perms_guest', JSON.stringify(newPerms));
    }
  };

  // Sync / Query real browser status
  const queryBrowserPermissions = async () => {
    const updated: Partial<PermissionProfile> = {};

    // 1. Camera / Mic cannot be directly queried in all browsers cleanly, so we check cached state or query permissions API
    try {
      if (navigator.permissions && (navigator.permissions as any).query) {
        // Query Mic
        try {
          const micStatus = await navigator.permissions.query({ name: 'microphone' as any });
          updated.microphone = micStatus.state as PermissionState;
        } catch {
          // fallback
        }

        // Query Camera
        try {
          const camStatus = await navigator.permissions.query({ name: 'camera' as any });
          updated.camera = camStatus.state as PermissionState;
        } catch {
          // fallback
        }

        // Query Geolocation
        try {
          const geoStatus = await navigator.permissions.query({ name: 'geolocation' as any });
          updated.location = geoStatus.state as PermissionState;
        } catch {
          // fallback
        }

        // Query Notifications
        try {
          const notifStatus = await navigator.permissions.query({ name: 'notifications' as any });
          updated.notifications = notifStatus.state as PermissionState;
        } catch {
          if ('Notification' in window) {
            const current = Notification.permission;
            updated.notifications = current === 'default' ? 'prompt' : (current as PermissionState);
          }
        }
      } else {
        // Fallback to Notification permission check directly if permission querying is unsupported
        if ('Notification' in window) {
          const current = Notification.permission;
          updated.notifications = current === 'default' ? 'prompt' : (current as PermissionState);
        }
      }
    } catch (e) {
      console.warn("Browser permission query api restricted/unsupported:", e);
    }

    setPermissions(prev => {
      const merged = { ...prev, ...updated };
      return merged;
    });
  };

  // Synchronize dynamic permissions profile
  useEffect(() => {
    // 1. Load cached permission guidelines
    const storageKey = user ? `perms_${user.uid}` : 'perms_guest';
    const cached = localStorage.getItem(storageKey);
    const seenModalKey = user ? `seen_welcome_${user.uid}` : 'seen_welcome_guest';
    const seenModal = localStorage.getItem(seenModalKey) === 'true';

    setHasSeenWelcomeModalState(seenModal);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setPermissions(parsed);
      } catch {
        // use default state
      }
    } else {
      // Default initial states
      setPermissions({
        camera: 'prompt',
        microphone: 'prompt',
        notifications: 'prompt',
        location: 'prompt',
        files: 'prompt',
        clipboard: 'prompt'
      });
    }

    queryBrowserPermissions();
  }, [user]);

  const setHasSeenWelcomeModal = (seen: boolean) => {
    setHasSeenWelcomeModalState(seen);
    const seenModalKey = user ? `seen_welcome_${user.uid}` : 'seen_welcome_guest';
    localStorage.setItem(seenModalKey, seen ? 'true' : 'false');
  };

  // 1. Camera Request Handler
  const requestCamera = async (): Promise<PermissionState> => {
    const nextState = await handleMediaRequest({ video: true }, 'camera');
    return nextState;
  };

  // 2. Microphone Request Handler
  const requestMicrophone = async (): Promise<PermissionState> => {
    const nextState = await handleMediaRequest({ audio: true }, 'microphone');
    return nextState;
  };

  // Unified Media stream requesting
  const handleMediaRequest = async (constraints: MediaStreamConstraints, key: 'camera' | 'microphone'): Promise<PermissionState> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Immediately stop track stream inputs to avoid active streaming indicators
      stream.getTracks().forEach(track => track.stop());
      
      setPermissions(prev => {
        const next = { ...prev, [key]: 'granted' as PermissionState };
        saveToLocalStorage(next);
        return next;
      });
      return 'granted';
    } catch (err: any) {
      console.error(`Media access error requesting ${key}:`, err);
      // Determine if really denied or prompt
      const result: PermissionState = (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('denied')) 
        ? 'denied' 
        : 'prompt';

      setPermissions(prev => {
        const next = { ...prev, [key]: result };
        saveToLocalStorage(next);
        return next;
      });
      return result;
    }
  };

  // 3. Notifications Request Handler
  const requestNotifications = async (): Promise<PermissionState> => {
    if (!('Notification' in window)) {
      console.warn("System Notifications API absent or disabled in active context");
      setPermissions(prev => {
        const next = { ...prev, notifications: 'denied' as PermissionState };
        saveToLocalStorage(next);
        return next;
      });
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      const status: PermissionState = permission === 'default' ? 'prompt' : (permission as PermissionState);
      
      setPermissions(prev => {
        const next = { ...prev, notifications: status };
        saveToLocalStorage(next);
        return next;
      });
      return status;
    } catch (err) {
      console.error("Notifications request failed:", err);
      // fallback manual prompt toggle
      setPermissions(prev => {
        const next = { ...prev, notifications: 'granted' as PermissionState };
        saveToLocalStorage(next);
        return next;
      });
      return 'granted';
    }
  };

  // 4. Geolocation Geoposition Request Handler
  const requestLocation = async (): Promise<PermissionState> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setPermissions(prev => {
          const next = { ...prev, location: 'denied' as PermissionState };
          saveToLocalStorage(next);
          return next;
        });
        resolve('denied');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissions(prev => {
            const next = { ...prev, location: 'granted' as PermissionState };
            saveToLocalStorage(next);
            return next;
          });
          resolve('granted');
        },
        (err) => {
          console.warn("Geolocation positioning fault:", err);
          const statusResult: PermissionState = err.code === err.PERMISSION_DENIED ? 'denied' : 'prompt';
          setPermissions(prev => {
            const next = { ...prev, location: statusResult };
            saveToLocalStorage(next);
            return next;
          });
          resolve(statusResult);
        },
        { timeout: 7000 }
      );
    });
  };

  // 5. File System Picker Simulated Indicator
  const requestFiles = async (): Promise<PermissionState> => {
    // Standard file pickers don't require static API consent, but we establish standard consent for Qyronix modules.
    setPermissions(prev => {
      const next = { ...prev, files: 'granted' as PermissionState };
      saveToLocalStorage(next);
      return next;
    });
    return 'granted';
  };

  // 6. Clipboard Access Requests API
  const requestClipboard = async (): Promise<PermissionState> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        setPermissions(prev => {
          const next = { ...prev, clipboard: 'granted' as PermissionState };
          saveToLocalStorage(next);
          return next;
        });
        return 'granted';
      }
      setPermissions(prev => {
        const next = { ...prev, clipboard: 'denied' as PermissionState };
        saveToLocalStorage(next);
        return next;
      });
      return 'denied';
    } catch (err) {
      console.warn("Failed checking clipboard capabilities", err);
      return 'denied';
    }
  };

  const resetPermissions = () => {
    const fresh: PermissionProfile = {
      camera: 'prompt',
      microphone: 'prompt',
      notifications: 'prompt',
      location: 'prompt',
      files: 'prompt',
      clipboard: 'prompt'
    };
    setPermissions(fresh);
    saveToLocalStorage(fresh);
  };

  const syncAllPermissions = async () => {
    await queryBrowserPermissions();
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        hasSeenWelcomeModal,
        setHasSeenWelcomeModal,
        requestCamera,
        requestMicrophone,
        requestNotifications,
        requestLocation,
        requestFiles,
        requestClipboard,
        resetPermissions,
        syncAllPermissions,
        isIframe
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be utilized within a PermissionProvider');
  }
  return context;
}
