import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  mfaEnabled: boolean;
  ssoProvider?: string;
  lastLoginAt: Date;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setupMFA: (secret: string) => Promise<void>;
  verifyMFA: (token: string) => Promise<boolean>;
  ssoLogin: (provider: string) => Promise<void>;
  checkPermission: (permission: string) => boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface LoginCredentials {
  email: string;
  password: string;
  mfaToken?: string;
  rememberMe?: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Enterprise Authentication Provider with 2FA and SSO support
 * Provides secure user authentication with role-based access control
 */
export function AuthenticationProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    permissions: []
  });

  const [sessionData, setSessionData] = useKV('auth-session', null);
  const [userPreferences, setUserPreferences] = useKV('user-preferences', {});

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for demo mode first
      const isDemoMode = localStorage.getItem('cortex-demo-mode') === 'true';
      
      if (isDemoMode) {
        console.log('Demo mode detected, activating...');
        await activateDemoMode();
        return;
      }

      if (sessionData?.token && sessionData?.expiresAt > Date.now()) {
        await validateSession(sessionData.token);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await logout();
    }
  };

  const activateDemoMode = async () => {
    const demoUser: User = {
      id: 'demo-user',
      email: 'demo@cortex.com', // Changed to match test account
      name: 'Demo User',
      avatar: '🚀',
      role: 'admin', // Give full access in demo mode
      permissions: [
        'read:notes', 'write:notes', 'delete:notes',
        'read:tasks', 'write:tasks', 'delete:tasks',
        'read:analytics', 'write:analytics',
        'read:team', 'write:team',
        'read:projects', 'write:projects',
        'read:collaboration', 'write:collaboration',
        'read:integrations', 'write:integrations',
        'admin:all'
      ],
      mfaEnabled: false,
      lastLoginAt: new Date(),
      createdAt: new Date()
    };

    console.log('Activating demo mode with user:', demoUser);

    setAuthState({
      user: demoUser,
      isAuthenticated: true,
      isLoading: false,
      permissions: demoUser.permissions
    });

    // Set demo session data
    await setSessionData({
      token: 'demo-token',
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      userId: demoUser.id
    });

    // Ensure we start at dashboard view
    try {
      await spark.kv.set('cortex-current-view', 'dashboard');
      // Clear any onboarding flags
      localStorage.removeItem('cortex-onboarding-completed');
      // Clear any tutorial or setup flags
      localStorage.removeItem('tutorial-completed');
      localStorage.removeItem('setup-completed');
    } catch (error) {
      console.warn('Could not set initial view state:', error);
    }

    await logAuditEvent('demo_mode_activated', {
      userId: demoUser.id,
      timestamp: new Date().toISOString()
    });
  };

  const validateSession = async (token: string) => {
    try {
      // In production, this would validate with your auth service
      const mockUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'editor',
        permissions: ['read:notes', 'write:notes', 'read:tasks', 'write:tasks'],
        mfaEnabled: true,
        lastLoginAt: new Date(),
        createdAt: new Date()
      };

      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        permissions: mockUser.permissions
      });

      // Log successful session validation
      await logAuditEvent('session_validated', { userId: mockUser.id });
    } catch (error) {
      throw new Error('Session validation failed');
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Step 1: Validate credentials
      const response = await authenticateUser(credentials);

      // Step 2: Check MFA requirement
      if (response.requiresMFA && !credentials.mfaToken) {
        throw new Error('MFA_REQUIRED');
      }

      // Step 3: Verify MFA if provided
      if (credentials.mfaToken) {
        const mfaValid = await verifyMFA(credentials.mfaToken);
        if (!mfaValid) {
          throw new Error('Invalid MFA token');
        }
      }

      // Step 4: Create session
      const sessionToken = generateSessionToken();
      const expiresAt = Date.now() + (credentials.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);

      await setSessionData({
        token: sessionToken,
        expiresAt,
        userId: response.user.id
      });

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        permissions: response.user.permissions
      });

      // Ensure we start at dashboard view for all logins
      try {
        await spark.kv.set('cortex-current-view', 'dashboard');
        // Clear any onboarding flags
        localStorage.removeItem('cortex-onboarding-completed');
        localStorage.removeItem('tutorial-completed');
        localStorage.removeItem('setup-completed');
      } catch (error) {
        console.warn('Could not set initial view state:', error);
      }

      // Log successful login
      await logAuditEvent('user_login', {
        userId: response.user.id,
        method: credentials.mfaToken ? 'email_mfa' : 'email_password',
        ipAddress: await getClientIP()
      });

      toast.success('Welcome back!', {
        description: `Logged in as ${response.user.name}`
      });

    } catch (error) {
      await logAuditEvent('login_failed', {
        email: credentials.email,
        error: error.message,
        ipAddress: await getClientIP()
      });

      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      if (error.message === 'MFA_REQUIRED') {
        throw error; // Let the UI handle MFA prompt
      }
      
      toast.error('Login failed', {
        description: error.message || 'Please check your credentials'
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const userId = authState.user?.id;
      
      // Clear demo mode flag
      localStorage.removeItem('cortex-demo-mode');
      
      // Clear session data
      await setSessionData(null);
      
      // Reset auth state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: []
      });

      // Log logout event
      if (userId) {
        await logAuditEvent('user_logout', { userId });
      }

      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const setupMFA = async (secret: string) => {
    try {
      if (!authState.user) throw new Error('Not authenticated');

      // In production, this would setup MFA with your auth service
      const qrCodeUrl = `otpauth://totp/Cortex:${authState.user.email}?secret=${secret}&issuer=Cortex`;
      
      await logAuditEvent('mfa_setup_initiated', { userId: authState.user.id });
      
      return qrCodeUrl;
    } catch (error) {
      toast.error('MFA setup failed', { description: error.message });
      throw error;
    }
  };

  const verifyMFA = async (token: string): Promise<boolean> => {
    try {
      // In production, this would verify with your TOTP service
      const isValid = token.length === 6 && /^\d+$/.test(token);
      
      if (authState.user) {
        await logAuditEvent('mfa_verification', {
          userId: authState.user.id,
          success: isValid
        });
      }

      return isValid;
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  };

  const ssoLogin = async (provider: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // In production, this would redirect to SSO provider
      const ssoUrl = `https://auth.cortex.com/sso/${provider}?redirect_uri=${encodeURIComponent(window.location.origin)}`;
      
      await logAuditEvent('sso_login_initiated', { provider });
      
      // For demo, simulate successful SSO
      setTimeout(async () => {
        const mockUser: User = {
          id: 'sso-user-123',
          email: 'user@company.com',
          name: 'Jane Doe',
          role: 'editor',
          permissions: ['read:notes', 'write:notes'],
          mfaEnabled: false,
          ssoProvider: provider,
          lastLoginAt: new Date(),
          createdAt: new Date()
        };

        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          permissions: mockUser.permissions
        });

        await logAuditEvent('sso_login_success', {
          userId: mockUser.id,
          provider
        });

        toast.success(`Logged in via ${provider}`);
      }, 2000);

    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      await logAuditEvent('sso_login_failed', { provider, error: error.message });
      toast.error('SSO login failed', { description: error.message });
      throw error;
    }
  };

  const checkPermission = (permission: string): boolean => {
    return authState.permissions.includes(permission) || authState.user?.role === 'admin';
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!authState.user) throw new Error('Not authenticated');

      const updatedUser = { ...authState.user, ...data };
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      await logAuditEvent('profile_updated', {
        userId: authState.user.id,
        updatedFields: Object.keys(data)
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Profile update failed', { description: error.message });
      throw error;
    }
  };

  // Helper functions
  const authenticateUser = async (credentials: LoginCredentials) => {
    // Mock authentication - in production, call your auth API
    return new Promise<{ user: User; requiresMFA: boolean }>((resolve, reject) => {
      setTimeout(() => {
        // Test account for demo purposes
        if (credentials.email === 'demo@cortex.com' && credentials.password === 'demo123') {
          // Clear any onboarding flags for test account too
          localStorage.removeItem('cortex-onboarding-completed');
          localStorage.removeItem('tutorial-completed');
          localStorage.removeItem('setup-completed');
          
          resolve({
            user: {
              id: 'test-user-demo',
              email: 'demo@cortex.com',
              name: 'Demo Test User',
              avatar: '🧪',
              role: 'admin', // Give full access for testing
              permissions: [
                'read:notes', 'write:notes', 'delete:notes',
                'read:tasks', 'write:tasks', 'delete:tasks',
                'read:analytics', 'write:analytics',
                'read:team', 'write:team',
                'read:projects', 'write:projects',
                'read:collaboration', 'write:collaboration',
                'read:integrations', 'write:integrations',
                'admin:all'
              ],
              mfaEnabled: false, // Skip MFA for test account
              lastLoginAt: new Date(),
              createdAt: new Date()
            },
            requiresMFA: false // Skip MFA for easier testing
          });
        }
        // Default mock authentication for other credentials
        else if (credentials.email && credentials.password) {
          resolve({
            user: {
              id: 'user-123',
              email: credentials.email,
              name: 'John Doe',
              role: 'editor',
              permissions: ['read:notes', 'write:notes', 'read:tasks', 'write:tasks'],
              mfaEnabled: true,
              lastLoginAt: new Date(),
              createdAt: new Date()
            },
            requiresMFA: true
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const generateSessionToken = (): string => {
    return btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  };

  const getClientIP = async (): Promise<string> => {
    try {
      // In production, you might get this from headers or a service
      return '192.168.1.1';
    } catch {
      return 'unknown';
    }
  };

  const logAuditEvent = async (event: string, data: any = {}) => {
    try {
      const auditLog = {
        event,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // In production, send to audit logging service
      console.log('Audit Log:', auditLog);
      
      // Store locally for demo (in production, don't store sensitive audit logs locally)
      try {
        const existingLogs = await spark.kv.get('audit-logs') || [];
        if (Array.isArray(existingLogs)) {
          const updatedLogs = [...existingLogs.slice(-999), auditLog]; // Keep last 1000 logs
          await spark.kv.set('audit-logs', updatedLogs);
        }
      } catch (kvError) {
        console.warn('Could not store audit log:', kvError);
      }
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    setupMFA,
    verifyMFA,
    ssoLogin,
    checkPermission,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthenticationProvider');
  }
  return context;
}