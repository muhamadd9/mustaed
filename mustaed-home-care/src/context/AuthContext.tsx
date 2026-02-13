import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService } from '@/services/auth.service';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
    user: any | null;
    token: string | null;
    role: string | null;
    login: (data: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(Cookies.get('token') || null);
    const [role, setRole] = useState<string | null>(Cookies.get('role') || null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = Cookies.get('token');
            if (storedToken) {
                try {
                    // Verify token by fetching user details
                    const response = await authService.getMe();

                    if (response.success) {
                        // Handle both structures: {data: {user: ...}} or {data: ...} where data IS the user
                        const userData = response.data?.user || response.data;

                        if (userData && userData._id) {
                            setUser(userData);
                            const userRole = userData.role;
                            // Update role if changed
                            if (userRole && userRole !== Cookies.get('role')) {
                                Cookies.set('role', userRole, { expires: 7, path: '/' });
                                setRole(userRole);
                            }
                        } else {
                            throw new Error("Failed to fetch user");
                        }
                    } else {
                        throw new Error("Failed to fetch user");
                    }
                } catch (error) {
                    console.error("Session valid check failed:", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [navigate]); // Check on mount

    const login = (data: any) => {
        // Expecting data to have { token, role, user ... } from backend response
        const accessToken = data.access_token || data.token;
        const userRole = data.user?.role || data.role;

        if (accessToken) {
            Cookies.set('token', accessToken, { expires: 7, path: '/' }); // 7 days, global path
            setToken(accessToken);
        }

        if (userRole) {
            Cookies.set('role', userRole, { expires: 7, path: '/' });
            setRole(userRole);
        }

        if (data.user) {
            setUser(data.user);
        }

        toast.success("تم تسجيل الدخول بنجاح");

        // Redirect based on role
        if (userRole === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        // Clean cookies explicitly here too
        Cookies.remove('token', { path: '/' });
        Cookies.remove('role', { path: '/' });

        toast.info("تم تسجيل الخروج");
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            role,
            login,
            logout,
            isAuthenticated: !!token && !!user,
            isLoading
        }}>
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
