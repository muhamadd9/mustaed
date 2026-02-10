
import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plan } from '@/services/plan.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Plan, '_id'>) => void;
    initialData?: Plan | null;
    isLoading?: boolean;
}

const PlanModal: React.FC<PlanModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Omit<Plan, '_id'>>({
        defaultValues: {
            name: '',
            subtitle: '',
            price: 0,
            discountPercentage: 0,
            priceAfterDiscount: 0,
            features: [''],
            billingPeriod: 'yearly',
            tag: '',
            visits: 0,
            isFeatured: false
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "features"
    });

    // Calculate priceAfterDiscount automatically
    const price = watch('price');
    const discountPercentage = watch('discountPercentage');

    useEffect(() => {
        if (price >= 0 && discountPercentage >= 0) {
            const discounted = price - (price * (discountPercentage / 100));
            setValue('priceAfterDiscount', Math.round(discounted));
        }
    }, [price, discountPercentage, setValue]);


    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    ...initialData,
                    features: initialData.features.length ? initialData.features : ['']
                });
            } else {
                reset({
                    name: '',
                    subtitle: '',
                    price: 0,
                    discountPercentage: 0,
                    priceAfterDiscount: 0,
                    features: [''],
                    billingPeriod: 'yearly',
                    tag: '',
                    visits: 0,
                    isFeatured: false
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const handleFormSubmit = (data: any) => {
        const cleanedData = {
            ...data,
            features: data.features.filter((f: string) => f.trim() !== '')
        };
        // Destructure system fields before passing to the prop onSubmit
        // The prop onSubmit expects Omit<Plan, '_id'>, so we need to remove _id
        // The instruction also asks to remove createdAt, updatedAt, __v, priceAfterDiscount
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, createdAt, updatedAt, __v, priceAfterDiscount, ...dataToSend } = cleanedData;
        onSubmit(dataToSend);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-2xl flex flex-col max-h-[90vh] overflow-hidden sm:rounded-lg [&>button]:left-4 [&>button]:right-auto"
                dir="rtl"
            >
                <DialogHeader className="text-right sm:text-right shrink-0">
                    <DialogTitle className="text-xl font-bold">
                        {initialData ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
                    </DialogTitle>
                </DialogHeader>

                {/* Native overflow scrolling handled here */}
                <div className="flex-1 overflow-y-auto px-1 py-2">
                    <form id="plan-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

                        {/* Row 1: Name and Visits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-right block w-full text-base">اسم الباقة</Label>
                                <Input
                                    id="name"
                                    {...register('name', { required: 'اسم الباقة مطلوب' })}
                                    className="text-right"
                                    placeholder="ادخل اسم الباقة"
                                    dir="rtl"
                                />
                                {errors.name && <span className="text-red-500 text-xs block text-right">{errors.name.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="visits" className="text-right block w-full text-base">عدد الزيارات (يجب أن يكون أكبر من 0)</Label>
                                <Input
                                    type="number"
                                    id="visits"
                                    {...register('visits', {
                                        valueAsNumber: true,
                                        required: 'عدد الزيارات مطلوب',
                                        min: { value: 1, message: 'يجب أن يكون عدد الزيارات 1 على الأقل' }
                                    })}
                                    className="text-right"
                                    placeholder="0"
                                    dir="rtl"
                                />
                                {errors.visits && <span className="text-red-500 text-xs block text-right">{errors.visits.message}</span>}
                            </div>
                        </div>

                        {/* Row 2: Subtitle */}
                        <div className="space-y-2">
                            <Label htmlFor="subtitle" className="text-right block w-full text-base">عنوان فرعي</Label>
                            <Input
                                id="subtitle"
                                {...register('subtitle')}
                                placeholder="مثال: أفضل قيمة للمنازل الكبيرة"
                                className="text-right"
                                dir="rtl"
                            />
                        </div>

                        {/* Row 3: Price, Discount, Final Price */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-right block w-full text-base">السعر الأساسي</Label>
                                <Input
                                    type="number"
                                    id="price"
                                    {...register('price', { valueAsNumber: true, min: 0 })}
                                    className="text-right"
                                    dir="rtl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discountPercentage" className="text-right block w-full text-base">الخصم (%)</Label>
                                <Input
                                    type="number"
                                    id="discountPercentage"
                                    {...register('discountPercentage', { valueAsNumber: true, min: 0, max: 100 })}
                                    className="text-right"
                                    dir="rtl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priceAfterDiscount" className="text-right block w-full text-base">السعر النهائي</Label>
                                <Input
                                    type="number"
                                    id="priceAfterDiscount"
                                    {...register('priceAfterDiscount', { valueAsNumber: true })}
                                    readOnly
                                    className="bg-gray-100 text-right font-bold text-primary"
                                    dir="rtl"
                                />
                            </div>
                        </div>

                        {/* Row 4: Billing Period and Tag */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="billingPeriod" className="text-right block w-full text-base">دورة الفوترة</Label>
                                <Select
                                    onValueChange={(val) => setValue('billingPeriod', val as 'yearly' | 'monthly')}
                                    defaultValue={watch('billingPeriod')}
                                    dir="rtl"
                                >
                                    <SelectTrigger className="text-right flex-row-reverse">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value="yearly" className="flex flex-row-reverse justify-end gap-2">سنوي</SelectItem>
                                        <SelectItem value="monthly" className="flex flex-row-reverse justify-end gap-2">شهري</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tag" className="text-right block w-full text-base">شارة مميزة (اختياري)</Label>
                                <Input
                                    id="tag"
                                    {...register('tag')}
                                    placeholder="مثال: الأكثر طلباً"
                                    className="text-right"
                                    dir="rtl"
                                />
                            </div>
                        </div>

                        {/* Row 5: Features List */}
                        <div className="space-y-2 border-t pt-4 mt-4">
                            <Label className="text-right block w-full text-lg font-semibold mb-2">المميزات</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mb-2 items-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                    <Input
                                        {...register(`features.${index}` as const)}
                                        placeholder={`ميزة رقم ${index + 1}`}
                                        className="text-right flex-1"
                                        dir="rtl"
                                    />
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append('')}
                                className="mt-3 w-full text-primary border-primary hover:bg-primary/10 flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> إضافة ميزة جديدة
                            </Button>
                        </div>
                    </form>
                </div>

                <DialogFooter className="mt-4 pt-4 border-t flex-row-reverse gap-2 shrink-0">
                    <Button type="submit" form="plan-form" disabled={isLoading} className="flex-1 bg-primary text-white hover:bg-primary/90">
                        {isLoading ? 'جاري الحفظ...' : (initialData ? 'تحديث البيانات' : 'إنشاء الباقة')}
                    </Button>
                    <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
                        إلغاء الأمر
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PlanModal;
