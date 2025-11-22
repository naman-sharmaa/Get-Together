import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'organizer';
  organizationName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, role?: 'user' | 'organizer') => Promise<void>;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'user' | 'organizer';
    organizationName?: string;
  }) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  isOrganizer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Skip auth check if we're on admin pages
    if (window.location.pathname.startsWith('/admin')) {
      setLoading(false);
      return;
    }

    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        // First, check if we're returning from a Firebase redirect
        try {
          const redirectResult = await getRedirectResult(auth);
          if (redirectResult) {
            // User just completed Firebase auth redirect
            const firebaseToken = await redirectResult.user.getIdToken();
            
            // Determine role from current URL or localStorage
            const role = localStorage.getItem('pendingAuthRole') || 'user';
            localStorage.removeItem('pendingAuthRole');
            
            // Send Firebase token to backend
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050/api'}/auth/firebase-google-auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                firebaseToken,
                role,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('token', data.token);
            }
          }
        } catch (redirectError) {
          // Not a redirect result, continue with normal auth check
        }

        const response = await authAPI.getMe();
        setUser(response.user);
      } catch (error) {
        // User is not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (when token is updated in another tab/window)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signIn = async (email: string, password: string, role?: 'user' | 'organizer') => {
    try {
      const response = await authAPI.signIn({ email, password, role });
      setUser(response.user);
      
      // Validate role if specified
      if (role && response.user.role !== role) {
        const roleName = response.user.role === 'organizer' ? 'organizer' : 'user';
        toast({
          title: 'Access Denied',
          description: `This account is registered as a ${roleName}. Please use the ${roleName} login page.`,
          variant: 'destructive',
        });
        authAPI.signOut();
        setUser(null);
        throw new Error(`Account is registered as ${roleName}`);
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'user' | 'organizer';
    organizationName?: string;
  }) => {
    try {
      const response = await authAPI.signUp(data);
      setUser(response.user);
      toast({
        title: 'Account created!',
        description: 'Welcome to EventHub.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Could not create account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = () => {
    authAPI.signOut();
    setUser(null);
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
        isOrganizer: user?.role === 'organizer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

