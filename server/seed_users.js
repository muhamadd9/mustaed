import { hashPassword } from './src/utils/security/hash.js';
import userModel from './src/DB/model/User.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), './server/src/config/.env.dev') });
// Manually set salt if not in env for hashing because the hashFile uses process.env.SALT
process.env.SALT = process.env.SALT || '8';

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

const seedUsers = async () => {
    await connectDB();

    const users = [
        {
            fullname: 'Admin User',
            email: 'admin@gmail.com',
            password: hashPassword({ plainText: '12345678' }),
            role: 'admin',
            phone: '0500000000'
        },
        {
            fullname: 'Regular User',
            email: 'user@gmail.com',
            password: hashPassword({ plainText: '12345678' }),
            role: 'user',
            phone: '0500000001'
        }
    ];

    for (const user of users) {
        const exists = await userModel.findOne({ email: user.email });
        if (exists) {
            console.log(`⚠️ User ${user.email} already exists.`);
        } else {
            await userModel.create(user);
            console.log(`✅ Created user: ${user.email} (Password: 12345678)`);
        }
    }

    console.log('🎉 Seeding complete.');
    process.exit(0);
};

seedUsers();
