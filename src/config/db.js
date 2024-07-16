import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose
        .connect(process.env.DB_URL)
        .then(console.log("Database is connected "))
        .catch((error) => {
            console.log("Unable to connect with DB");
            console.log(error);
        });
};

export { connectDB };
