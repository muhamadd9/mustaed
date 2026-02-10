import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { RYIADH_REGIONS } from '@/utils/constants';

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            fullname: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            city: 'الرياض',
            place: '', // This will map to 'Region' (e.g. شمال الرياض)
            district: '',
        }
    });

    const selectedRegion = watch('place');

    const onSubmit = async (data: any) => {
        if (data.password !== data.confirmPassword) {
            toast.error('كلمات المرور غير متطابقة');
            return;
        }

        setIsLoading(true);
        try {
            // Prepare data for backend
            const userData = {
                fullname: data.fullname,
                email: data.email,
                phone: data.phone,
                password: data.password,
                role: 'user', // Default role
                city: data.city,
                place: data.place,
                district: data.district,
            };

            const response = await authService.register(userData);

            if (response.success || response.user) {
                toast.success('تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.');
                navigate('/login');
            } else {
                toast.error(response.message || 'فشل إنشاء الحساب');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-24 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-2xl w-full space-y-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">إنشاء حساب جديد</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        لديك حساب بالفعل؟{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="fullname" className="text-right block text-sm">الاسم الكامل</Label>
                            <Input
                                id="fullname"
                                className="text-right h-9 text-sm"
                                placeholder="الاسم الثلاتي"
                                {...register('fullname', { required: 'الاسم مطلوب', minLength: { value: 3, message: 'الاسم يجب أن يكون 3 أحرف على الأقل' } })}
                            />
                            {errors.fullname && <span className="text-red-500 text-xs block">{errors.fullname.message as string}</span>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-right block text-sm">رقم الجوال</Label>
                            <Input
                                id="phone"
                                className="text-right h-9 text-sm"
                                dir="ltr"
                                placeholder="05xxxxxxxx"
                                {...register('phone', {
                                    required: 'رقم الجوال مطلوب',
                                    pattern: { value: /^05\d{8}$/, message: 'صيغة رقم الجوال غير صحيحة (يبدأ بـ 05)' }
                                })}
                            />
                            {errors.phone && <span className="text-red-500 text-xs block">{errors.phone.message as string}</span>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="email" className="text-right block text-sm">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                className="text-right h-9 text-sm"
                                placeholder="example@domain.com"
                                {...register('email', { required: 'البريد الإلكتروني مطلوب' })}
                            />
                            {errors.email && <span className="text-red-500 text-xs block">{errors.email.message as string}</span>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-right block text-sm">كلمة المرور</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="text-right pl-9 pr-2 h-9 text-sm"
                                    placeholder="••••••••"
                                    {...register('password', { required: 'كلمة المرور مطلوبة', minLength: { value: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' } })}
                                />
                                <button
                                    type="button"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-xs block">{errors.password.message as string}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-right block text-sm">تأكيد كلمة المرور</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="text-right pl-9 pr-2 h-9 text-sm"
                                    placeholder="••••••••"
                                    {...register('confirmPassword', { required: 'تأكيد كلمة المرور مطلوب' })}
                                />
                                <button
                                    type="button"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            تحديد الموقع (نطاق التغطية)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* City (Fixed) */}
                            <div className="space-y-1.5">
                                <Label className="text-right block text-sm">المدينة</Label>
                                <Input value="الرياض" disabled className="bg-gray-100 text-right font-semibold h-9 text-sm" />
                            </div>

                            {/* Region (Place) */}
                            <div className="space-y-1.5">
                                <Label className="text-right block text-sm">المنطقة</Label>
                                <Controller
                                    name="place"
                                    control={control}
                                    rules={{ required: 'يرجى اختيار المنطقة' }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                setValue('district', ''); // Reset district when region changes
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="text-right h-9 text-sm">
                                                <SelectValue placeholder="اختر المنطقة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(RYIADH_REGIONS).map((region) => (
                                                    <SelectItem key={region} value={region} className="text-right flex-row-reverse text-sm">
                                                        {region}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.place && <span className="text-red-500 text-xs block">{errors.place.message as string}</span>}
                            </div>

                            {/* District using Region */}
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-right block text-sm">الحي</Label>
                                <Controller
                                    name="district"
                                    control={control}
                                    rules={{ required: 'يرجى اختيار الحي' }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!selectedRegion}
                                        >
                                            <SelectTrigger className="text-right h-9 text-sm">
                                                <SelectValue placeholder={selectedRegion ? "اختر الحي" : "يرجى اختيار المنطقة أولاً"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedRegion && (RYIADH_REGIONS as any)[selectedRegion]?.map((dist: string) => (
                                                    <SelectItem key={dist} value={dist} className="text-right flex-row-reverse text-sm">
                                                        {dist}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.district && <span className="text-red-500 text-xs block">{errors.district.message as string}</span>}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-6"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'إنشاء الحساب'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Register;
