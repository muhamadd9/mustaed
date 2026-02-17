import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    FileText,
    ClipboardList,
    Wallet,
    LogOut,
    PanelRightClose,
    PanelRightOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/mustaed-logo.png";

interface AdminSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
    const location = useLocation();
    const { logout } = useAuth();

    const links = [
        { name: "لوحة التحكم", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "المستخدمين", path: "/admin/users", icon: Users },
        { name: "الباقات", path: "/admin/plans", icon: CreditCard },
        { name: "الاشتراكات", path: "/admin/subscriptions", icon: FileText },
        { name: "المدفوعات", path: "/admin/payments", icon: Wallet },
        { name: "طلبات الزيارات", path: "/admin/orders", icon: ClipboardList },
    ];

    return (
        <div
            className={cn(
                "h-screen bg-white border-l shadow-sm flex flex-col fixed right-0 top-0 z-50 transition-all duration-300",
                collapsed ? "w-[72px]" : "w-64"
            )}
        >
            {/* Logo & Header */}
            <div className="border-b flex items-center justify-between p-4">
                <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center w-full")}>
                    <img
                        src={logo}
                        alt="مستعد"
                        className={cn(
                            "object-contain transition-all duration-300",
                            collapsed ? "h-9 w-9" : "h-10 w-10"
                        )}
                    />
                    {!collapsed && (
                        <div className="whitespace-nowrap">
                            <h2 className="text-lg font-bold text-primary leading-tight">مستعد</h2>
                            <p className="text-xs text-gray-500">لوحة تحكم المسؤول</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;

                    const button = (
                        <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                                "w-full mb-0.5 transition-all duration-200",
                                collapsed ? "justify-center px-2" : "justify-start gap-3",
                                isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                            )}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span className="whitespace-nowrap">{link.name}</span>}
                        </Button>
                    );

                    if (collapsed) {
                        return (
                            <Tooltip key={link.path}>
                                <TooltipTrigger asChild>
                                    <Link to={link.path}>{button}</Link>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>{link.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return (
                        <Link key={link.path} to={link.path}>
                            {button}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t space-y-1">
                {/* Toggle Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200",
                                collapsed ? "justify-center px-2" : "justify-start gap-3"
                            )}
                            onClick={onToggle}
                        >
                            {collapsed ? (
                                <PanelRightOpen className="h-5 w-5 shrink-0" />
                            ) : (
                                <>
                                    <PanelRightClose className="h-5 w-5 shrink-0" />
                                    <span className="whitespace-nowrap">طي القائمة</span>
                                </>
                            )}
                        </Button>
                    </TooltipTrigger>
                    {collapsed && (
                        <TooltipContent side="left">
                            <p>فتح القائمة</p>
                        </TooltipContent>
                    )}
                </Tooltip>

                {/* Logout */}
                {collapsed ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-center px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={logout}
                            >
                                <LogOut className="h-5 w-5 shrink-0" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>تسجيل الخروج</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={logout}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="whitespace-nowrap">تسجيل الخروج</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AdminSidebar;
