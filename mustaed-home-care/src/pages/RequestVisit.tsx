import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Send, ClipboardList, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { orderService } from '@/services/order.service';
import { subscriptionService } from '@/services/subscription.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { RYIADH_REGIONS } from '@/utils/constants';

const RequestVisit = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const { handleSubmit, control, watch, setValue, register, formState: { errors } } = useForm({
        defaultValues: {
            city: 'الرياض',
            place: '',
            district: '',
            notes: '',
        }
    });

    const selectedRegion = watch('place');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchSubscription();
    }, [isAuthenticated]);

    // Pre-fill location from user data
    useEffect(() => {
        if (user) {
            if (user.place) {
                setValue('place', user.place);
            }
            if (user.district) {
                setValue('district', user.district);
            }
        }
    }, [user, setValue]);

    const fetchSubscription = async () => {
        try {
            const response = await subscriptionService.getMySubscriptions();
            if (response.success && response.data.current) {
                setSubscription(response.data.current);
            }
        } catch (error: any) {
            console.error('Error fetching subscription:', error);
        } finally {
            setPageLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await orderService.create({
                city: data.city,
                place: data.place,
                district: data.district,
                notes: data.notes || '',
            });

            if (response.success) {
                toast.success('تم إرسال طلب الزيارة بنجاح!');
                navigate('/my-visits');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
        } finally {
            setIsLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // No subscription
    if (!subscription) {
        return (
            <div className="min-h-screen bg-gray-50 py-28 px-4" dir="rtl">
                <div className="container mx-auto max-w-lg">
                    <Card>
                        <CardContent className="py-16 text-center">
                            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">لا يوجد اشتراك نشط</h3>
                            <p className="text-muted-foreground mb-6">يجب أن يكون لديك اشتراك نشط لطلب زيارة</p>
                            <Button onClick={() => navigate('/#packages')} className="btn-hero-primary">
                                تصفح الباقات
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // No visits remaining
    if (subscription.visits <= 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-28 px-4" dir="rtl">
                <div className="container mx-auto max-w-lg">
                    <Card>
                        <CardContent className="py-16 text-center">
                            <AlertTriangle className="w-16 h-16 mx-auto text-red-400 mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد زيارات متبقية</h3>
                            <p className="text-muted-foreground mb-6">لقد استنفذت جميع الزيارات المتاحة في اشتراكك الحالي</p>
                            <Button onClick={() => navigate('/#packages')} className="btn-hero-primary">
                                ترقية الباقة
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-28 px-4" dir="rtl">
            <div className="container mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">طلب زيارة</h1>
                    <p className="text-gray-500 mt-2">حدد موقع الزيارة وأرسل طلبك</p>
                </div>

                {/* Visits Counter */}
                <Card className="mb-6 border-primary/20 overflow-hidden">
                    <div className="bg-gradient-to-l from-primary to-primary/80 text-white p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <ClipboardList className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">الزيارات المتبقية</p>
                                    <p className="text-2xl font-bold">{subscription.visits} زيارة</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-white/80 text-sm">الباقة</p>
                                <p className="font-semibold">{subscription.planName}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Order Form */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* User Info (Read-only) */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-600 mb-3">بيانات العميل</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">الاسم</p>
                                        <p className="text-sm font-medium">{user?.fullname}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">رقم الجوال</p>
                                        <p className="text-sm font-medium" dir="ltr">{user?.phone || '-'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                                        <p className="text-sm font-medium">{user?.email || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div>
                                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    موقع الزيارة
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* City (Fixed) */}
                                    <div className="space-y-1.5">
                                        <Label className="text-right block text-sm">المدينة</Label>
                                        <Input value="الرياض" disabled className="bg-gray-100 text-right font-semibold h-10 text-sm" />
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
                                                        setValue('district', '');
                                                    }}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger className="text-right h-10 text-sm">
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

                                    {/* District */}
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
                                                    <SelectTrigger className="text-right h-10 text-sm">
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

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label className="text-right block text-sm">ملاحظات إضافية (اختياري)</Label>
                                <Textarea
                                    className="text-right min-h-[100px] text-sm resize-none"
                                    placeholder="أضف أي تفاصيل أو ملاحظات خاصة بالزيارة..."
                                    {...register('notes')}
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        إرسال طلب الزيارة
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RequestVisit;
