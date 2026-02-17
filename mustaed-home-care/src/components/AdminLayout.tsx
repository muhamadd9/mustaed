import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "admin-sidebar-collapsed";

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) === "true";
    });

    const handleToggle = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 direction-rtl" dir="rtl">
            <AdminSidebar collapsed={collapsed} onToggle={handleToggle} />
            <main
                className={cn(
                    "p-8 min-h-screen transition-all duration-300",
                    collapsed ? "mr-[72px]" : "mr-64"
                )}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
