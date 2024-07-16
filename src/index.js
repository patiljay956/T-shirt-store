import app from "./app.js";
// process.loadEnvFile(); // for the nodejs version 21+
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});
import cloudinary from "cloudinary";

import { connectDB } from "./config/db.js";
connectDB();

// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const port = process.env?.PORT || 4000;
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
