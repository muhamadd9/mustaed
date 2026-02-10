
import React from 'react';
import { Plan } from '@/services/plan.service';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Edit, Trash2, Sparkles } from 'lucide-react';

interface PlanCardProps {
    plan: Plan;
    onEdit: (plan: Plan) => void;
    onDelete: (id: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onDelete }) => {
    return (
        <Card className={`relative flex flex-col h-full border-2 transition-all hover:shadow-lg ${plan.isFeatured || plan.tag ? 'border-primary/50 shadow-md' : 'border-transparent shadow-sm'}`}>
            {plan.tag && (
                <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-sm z-10 flex items-center gap-1">
                    <Sparkles size={14} /> {plan.tag}
                </div>
            )}

            <CardHeader className="text-center pb-2 pt-8">
                <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-fit mb-4 text-primary">
                    <Sparkles size={24} />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{plan.name}</CardTitle>
                {plan.subtitle && <p className="text-sm text-gray-500 mt-1">{plan.subtitle}</p>}
                <div className="mt-2 inline-block bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-md text-sm font-medium">
                    {plan.visits} زيارات
                </div>
            </CardHeader>

            <CardContent className="flex-grow text-center">
                <div className="mb-6">
                    <span className="text-3xl font-bold text-primary">{plan.priceAfterDiscount}</span>
                    <span className="text-sm text-gray-500 mr-1">ريال / {plan.billingPeriod === 'yearly' ? 'سنوياً' : 'شهرياً'}</span>
                    {plan.discountPercentage > 0 && (
                        <div className="text-sm text-gray-400 line-through mt-1">{plan.price} ريال</div>
                    )}
                </div>

                <div className="space-y-3 text-right">
                    {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="min-w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => onEdit(plan)}>
                    <Edit size={16} /> تعديل
                </Button>
                <Button variant="destructive" className="flex-1 gap-2" onClick={() => onDelete(plan._id)}>
                    <Trash2 size={16} /> حذف
                </Button>
            </CardFooter>
        </Card>
    );
};

export default PlanCard;
