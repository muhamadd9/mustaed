import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, ArrowLeft, Package, RotateCcw } from 'lucide-react';

const PaymentReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending');

    const respStatus = searchParams.get('respStatus');
    const tranRef = searchParams.get('tranRef');

    useEffect(() => {
        if (respStatus === 'A') {
            setStatus('success');
        } else if (respStatus) {
            setStatus('failed');
        } else {
            setStatus('pending');
        }
    }, [respStatus]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-28 px-4" dir="rtl">
            <Card className="w-full max-w-md overflow-hidden">
                {status === 'success' && (
                    <>
                        <div className="bg-gradient-to-l from-green-500 to-green-600 p-8 text-center text-white">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold mb-2">تمت عملية الدفع بنجاح!</h1>
                            <p className="text-green-100">تم تفعيل اشتراكك بنجاح</p>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            {tranRef && (
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">رقم المعاملة</p>
                                    <p className="font-mono text-sm font-bold">{tranRef}</p>
                                </div>
                            )}
                            <div className="space-y-3">
                                <Button
                                    className="w-full py-6 text-lg btn-hero-primary"
                                    onClick={() => navigate('/my-subscription')}
                                >
                                    <Package className="w-5 h-5 ml-2" />
                                    عرض اشتراكي
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate('/')}
                                >
                                    <ArrowLeft className="w-4 h-4 ml-2" />
                                    الرجوع للرئيسية
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="bg-gradient-to-l from-red-500 to-red-600 p-8 text-center text-white">
                            <XCircle className="w-16 h-16 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold mb-2">فشلت عملية الدفع</h1>
                            <p className="text-red-100">لم تتم عملية الدفع، يرجى المحاولة مرة أخرى</p>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            {tranRef && (
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">رقم المعاملة</p>
                                    <p className="font-mono text-sm font-bold">{tranRef}</p>
                                </div>
                            )}
                            <div className="space-y-3">
                                <Button
                                    className="w-full py-6 text-lg"
                                    onClick={() => navigate('/#packages')}
                                >
                                    <RotateCcw className="w-5 h-5 ml-2" />
                                    المحاولة مرة أخرى
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate('/')}
                                >
                                    <ArrowLeft className="w-4 h-4 ml-2" />
                                    الرجوع للرئيسية
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <div className="bg-gradient-to-l from-yellow-500 to-yellow-600 p-8 text-center text-white">
                            <Clock className="w-16 h-16 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold mb-2">جاري معالجة الدفع</h1>
                            <p className="text-yellow-100">يرجى الانتظار، جاري التحقق من حالة الدفع</p>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate('/my-subscription')}
                                >
                                    <Package className="w-5 h-5 ml-2" />
                                    التحقق من اشتراكي
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate('/')}
                                >
                                    <ArrowLeft className="w-4 h-4 ml-2" />
                                    الرجوع للرئيسية
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
};

export default PaymentReturn;
