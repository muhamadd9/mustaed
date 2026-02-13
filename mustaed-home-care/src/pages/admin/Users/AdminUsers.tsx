import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { userService, User } from '@/services/user.service';
import { toast } from 'sonner';
import {
    Loader2, Users, Search, ChevronLeft, ChevronRight, MapPin, Mail,
    Phone, Calendar, Shield, UserCheck, Eye, X
} from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    // Detail modal
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    const fetchData = useCallback(async (isInitial = false) => {
        if (isInitial) setInitialLoading(true);
        else setTableLoading(true);
        try {
            const res = await userService.getAll(page, limit, search || undefined);
            if (res.success) {
                setUsers(res.data.users);
                setTotalCount(res.data.count);
                setTotalPages(Math.ceil(res.data.count / limit));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في جلب البيانات');
        } finally {
            setInitialLoading(false);
            setTableLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchData(!users.length);
    }, [page, search]);

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearch('');
        setPage(1);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">المستخدمين</h1>
                <p className="text-gray-500 mt-2">إدارة ومتابعة جميع المستخدمين المسجلين</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">إجمالي المستخدمين</CardTitle>
                        <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">المستخدمين النشطين</CardTitle>
                        <UserCheck className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.isActive).length > 0 ? totalCount : 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">المشرفين</CardTitle>
                        <Shield className="h-5 w-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {users.filter(u => u.role === 'admin').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>قائمة المستخدمين ({totalCount})</CardTitle>
                        <div className="flex gap-2 items-center">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="بحث بالاسم أو البريد أو الجوال..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    className="pr-9 text-right h-9 text-sm"
                                />
                                {searchInput && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <Button size="sm" onClick={handleSearch}>
                                بحث
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {!tableLoading && users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">
                                {search ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمين'}
                            </p>
                        </div>
                    ) : (
                        <div className="relative">
                            {tableLoading && (
                                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b text-sm text-muted-foreground">
                                            <th className="pb-3 pr-4 font-medium">المستخدم</th>
                                            <th className="pb-3 font-medium">الجوال</th>
                                            <th className="pb-3 font-medium">الموقع</th>
                                            <th className="pb-3 font-medium">الدور</th>
                                            <th className="pb-3 font-medium">تاريخ التسجيل</th>
                                            <th className="pb-3 font-medium">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {users.map((user) => (
                                            <tr key={user._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-bold text-primary">
                                                                {user.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{user.fullname}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email || '-'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-muted-foreground" dir="ltr">
                                                    {user.phone || '-'}
                                                </td>
                                                <td className="py-4 text-muted-foreground text-xs">
                                                    {user.place && user.district
                                                        ? `${user.place} - ${user.district}`
                                                        : user.city || '-'
                                                    }
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        user.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {user.role === 'admin' ? 'مشرف' : 'مستخدم'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-muted-foreground">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1 text-xs"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowDetail(true);
                                                        }}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        عرض
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        صفحة {page} من {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                            السابق
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                        >
                                            التالي
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User Detail Dialog */}
            <Dialog open={showDetail} onOpenChange={setShowDetail}>
                <DialogContent className="max-w-lg" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تفاصيل المستخدم</DialogTitle>
                        <DialogDescription>عرض كامل معلومات المستخدم</DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-5">
                            {/* Avatar + Name */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xl font-bold text-primary">
                                        {selectedUser.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{selectedUser.fullname}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        selectedUser.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {selectedUser.role === 'admin' ? 'مشرف' : 'مستخدم'}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-600">معلومات التواصل</h4>
                                {selectedUser.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{selectedUser.email}</span>
                                    </div>
                                )}
                                {selectedUser.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span dir="ltr">{selectedUser.phone}</span>
                                    </div>
                                )}
                                {!selectedUser.email && !selectedUser.phone && (
                                    <p className="text-sm text-muted-foreground">لا توجد معلومات تواصل</p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-600">الموقع</h4>
                                {selectedUser.city || selectedUser.place || selectedUser.district ? (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>
                                            {[selectedUser.city, selectedUser.place, selectedUser.district]
                                                .filter(Boolean)
                                                .join(' - ')}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">لم يتم تحديد الموقع</p>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>تاريخ التسجيل: {formatDateTime(selectedUser.createdAt)}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminUsers;
