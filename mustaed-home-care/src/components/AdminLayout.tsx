import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 direction-rtl" dir="rtl">
            <AdminSidebar />
            <main className="mr-64 p-8 min-h-screen transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
