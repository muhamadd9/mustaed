import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data.email, data.password);
            if (response.success) {
                login(response.data);
                // Toast is handled in login function usually, but safe to add here if needed
            } else {
                toast.error(response.message || 'فشل تسجيل الدخول');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">تسجيل الدخول</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        أو{' '}
                        <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email" className="text-right block mb-2">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                dir="rtl"
                                className="text-right"
                                placeholder="example@domain.com"
                                {...register('email', { required: 'البريد الإلكتروني مطلوب' })}
                            />
                            {errors.email && <span className="text-red-500 text-xs text-right block mt-1">{errors.email.message as string}</span>}
                        </div>

                        <div className="relative">
                            <Label htmlFor="password" className="text-right block mb-2">كلمة المرور</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    dir="ltr" // Password usually LTR for input stability, or RTL but care needed
                                    className="text-right pr-4 pl-10" // Space for icon on left
                                    placeholder="••••••••"
                                    {...register('password', { required: 'كلمة المرور مطلوبة' })}
                                />
                                <button
                                    type="button"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-xs text-right block mt-1">{errors.password.message as string}</span>}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'تسجيل الدخول'}
                    </Button>

                    <div className="text-center mt-4">
                        <span className="text-gray-600 text-sm">ليس لديك حساب؟ </span>
                        <Link to="/register" className="font-medium text-primary hover:text-primary/80 text-sm">
                            إنشاء حساب جديد
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
