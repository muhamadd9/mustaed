import userModel from "./model/User.model.js";
import planModel from "./model/Plan.model.js";
import { hashPassword } from "../utils/security/hash.js";

export const seedDefaultData = async () => {
    try {
        // Create default users if they don't exist
        const adminEmail = "admin@gmail.com";
        const userEmail = "user@gmail.com";
        const defaultPassword = "123456789";

        // Check and create admin user
        const existingAdmin = await userModel.findOne({ email: adminEmail });
        if (!existingAdmin) {
            await userModel.create({
                fullname: "Admin User",
                email: adminEmail,
                password: hashPassword({ plainText: defaultPassword }),
                role: "admin",
                isActive: true
            });
            console.log("✅ Default admin user created (admin@gmail.com / 123456789)");
        } else {
            console.log("ℹ️  Admin user already exists");
        }

        // Check and create regular user
        const existingUser = await userModel.findOne({ email: userEmail });
        if (!existingUser) {
            await userModel.create({
                fullname: "Regular User",
                email: userEmail,
                password: hashPassword({ plainText: defaultPassword }),
                role: "user",
                isActive: true
            });
            console.log("✅ Default user created (user@gmail.com / 123456789)");
        } else {
            console.log("ℹ️  Regular user already exists");
        }

        // Create default plans if they don't exist
        const plansCount = await planModel.countDocuments();
        if (plansCount === 0) {
            await planModel.insertMany([
                {
                    name: "الباقة الأساسية",
                    description: "باقة مناسبة للتجمعات الصغيرة والمناسبات العائلية المحدودة.",
                    price: 50,
                    discountPercentage: 0,
                    priceAfterDiscount: 50,
                    limits: { maxInvitations: 50 },
                    isFeatured: false
                },
                {
                    name: "الباقة الفضية",
                    description: "الخيار الأمثل للمناسبات المتوسطة وحفلات الزفاف المصغرة.",
                    price: 150,
                    discountPercentage: 10,
                    priceAfterDiscount: 135,
                    limits: { maxInvitations: 150 },
                    isFeatured: true
                },
                {
                    name: "الباقة الذهبية",
                    description: "باقة شاملة للمناسبات الكبيرة والفعاليات الضخمة.",
                    price: 300,
                    discountPercentage: 20,
                    priceAfterDiscount: 240,
                    limits: { maxInvitations: 500 },
                    isFeatured: false
                }
            ]);
            console.log("✅ Default pricing plans created");
        }

    } catch (error) {
        console.error("❌ Error seeding default data:", error.message);
    }
};
