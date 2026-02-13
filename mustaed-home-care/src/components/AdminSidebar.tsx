import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, CreditCard, FileText, Settings, LogOut, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AdminSidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const links = [
        { name: "لوحة التحكم", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "المستخدمين", path: "/admin/users", icon: Users },
        { name: "الباقات", path: "/admin/plans", icon: CreditCard },
        { name: "الاشتراكات", path: "/admin/subscriptions", icon: FileText },
        { name: "طلبات الزيارات", path: "/admin/orders", icon: ClipboardList },
        { name: "الإعدادات", path: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="h-screen w-64 bg-white border-l shadow-sm flex flex-col fixed right-0 top-0 z-50">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-primary">مستعد</h2>
                <p className="text-sm text-gray-500">لوحة تحكم المسؤول</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <Link key={link.path} to={link.path}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 mb-1",
                                    isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {link.name}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={logout}
                >
                    <LogOut className="h-5 w-5" />
                    تسجيل الخروج
                </Button>
            </div>
        </div>
    );
};

export default AdminSidebar;
