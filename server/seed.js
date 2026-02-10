import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import planModel from "./src/DB/model/Plan.model.js";
import { seedDefaultData } from "./src/DB/seed.js";

// Load env
dotenv.config({ path: path.resolve("./src/config/.env.dev") });
dotenv.config({ path: path.resolve("./src/config/.env") });
dotenv.config({ path: path.resolve("./.env.dev") });
dotenv.config({ path: path.resolve("./.env") });

const seed = async () => {
    try {
        const dbUri = process.env.DB_URI || process.env.DB_CONNECTION;
        if (!dbUri) {
            throw new Error("DB_URI is undefined");
        }
        await mongoose.connect(dbUri);
        console.log("Connected to DB");

        // Clear existing plans to ensure new ones are created
        console.log("Clearing existing plans...");
        await planModel.deleteMany({});
        console.log("Existing plans cleared.");

        // Run seed function
        console.log("Seeding default data...");
        await seedDefaultData();

        console.log("Seeding complete!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seed();
