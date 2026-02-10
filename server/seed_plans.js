import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import planModel from './src/DB/model/Plan.model.js';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), './server/src/config/.env.dev') });

const connectDB = async () => {
    try {
        console.log('Connecting to:', process.env.DB_URI);
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ Connected to DB');
    } catch (error) {
        console.error('❌ DB Connection Error:', error);
        process.exit(1);
    }
};

const seedPlans = async () => {
    await connectDB();

    const plans = [
        {
            name: "باقة تنظيف - 6 زيارات",
            subtitle: "أفضل قيمة - مناسبة للمنازل الكبيرة",
            price: 999,
            priceAfterDiscount: 999,
            discountPercentage: 0,
            features: [
                "6 زيارات تنظيف سنوية",
                "تنظيف عميق وشامل",
                "مواد تنظيف فاخرة",
                "فريق تنظيف محترف",
                "تنظيف السجاد والمفروشات",
                "أولوية في المواعيد"
            ],
            billingPeriod: 'yearly',
            visits: 6,
            isFeatured: false
        },
        {
            name: "باقة تنظيف - 3 زيارات",
            subtitle: "مناسبة للشقق الصغيرة",
            price: 699,
            priceAfterDiscount: 699,
            discountPercentage: 0,
            features: [
                "3 زيارات تنظيف سنوية",
                "تنظيف شامل",
                "مواد تنظيف متميزة",
                "فريق تنظيف محترف"
            ],
            billingPeriod: 'yearly',
            visits: 3,
            isFeatured: false
        },
        {
            name: "باقة مساعد - صيانة",
            subtitle: "اشتراك سنوي شامل لجميع خدمات الصيانة",
            price: 799,
            priceAfterDiscount: 799,
            discountPercentage: 0,
            features: [
                "صيانة السباكة",
                "صيانة الكهرباء",
                "صيانة التكييف",
                "التركيب والصيانة العامة",
                "دعم فني على مدار الساعة",
                "أولوية في الحجز"
            ],
            billingPeriod: 'yearly',
            tag: "الأكثر طلباً",
            isFeatured: true,
            visits: 0 // Unlimited or specialized
        }
    ];

    try {
        // Clear existing plans to avoid duplicates or use update logic
        await planModel.deleteMany({});
        console.log('🗑️ Cleared existing plans');

        await planModel.insertMany(plans);
        console.log('✅ Seeded 3 plans successfully');
    } catch (error) {
        console.error('❌ Error seeding plans:', error);
    }

    process.exit(0);
};

seedPlans();
