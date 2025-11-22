import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin';
  permissions: {
    canManageUsers: boolean;
    canManageEvents: boolean;
    canManagePayouts: boolean;
    canToggleMaintenance: boolean;
    canViewAnalytics: boolean;
  };
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const storedAdmin = localStorage.getItem('adminUser');

        if (token && storedAdmin) {
          const response = await fetch('http://localhost:5050/api/admin/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAdmin(data.admin);
          } else {
            // Token is invalid, clear it
            console.log('Invalid token, clearing auth data');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setAdmin(null);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear on error too
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const adminLogin = async (email: string, password: string) => {
    try {
      // Clear any existing tokens first
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      const response = await fetch('http://localhost:5050/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login successful, token received:', data.token?.substring(0, 20) + '...');
      
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      setAdmin(data.admin);

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.admin.name}!`,
      });

      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
    navigate('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        adminLogin,
        adminLogout,
        isAuthenticated: !!admin,
        isSuperAdmin: admin?.role === 'super-admin',
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
