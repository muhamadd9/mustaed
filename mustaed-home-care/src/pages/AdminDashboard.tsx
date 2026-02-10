import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";

const AdminDashboard = () => {
    const { user } = useAuth();

    const stats = [
        { title: "إجمالي المستخدمين", value: "1,234", icon: Users, color: "text-blue-500" },
        { title: "الطلبات النشطة", value: "56", icon: Clock, color: "text-orange-500" },
        { title: "الطلبات المكتملة", value: "892", icon: CheckCircle, color: "text-green-500" },
        { title: "الباقات المباعة", value: "320", icon: FileText, color: "text-purple-500" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-gray-500 mt-2">مرحباً بك، {user?.fullname || 'المسؤول'}. إليك نظرة عامة على النظام.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-gray-500 mt-1">+20.1% من الشهر الماضي</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>النشاط الأخير</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 text-center py-8">لا يوجد نشاط حديث لعرضه</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>حالة النظام</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-green-50 p-3 rounded-md">
                                <span className="flex items-center gap-2 text-green-700">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    قاعدة البيانات
                                </span>
                                <span className="text-green-600 font-medium">متصل</span>
                            </div>
                            <div className="flex justify-between items-center bg-green-50 p-3 rounded-md">
                                <span className="flex items-center gap-2 text-green-700">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    الخدمات
                                </span>
                                <span className="text-green-600 font-medium">تعمل</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
