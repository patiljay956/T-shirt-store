import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxLength: [50, "Name cannot exceed 30 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, "Please enter a valid email"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "password should be min 6 "],
            select: false,
        },
        role: {
            type: String,
            default: "user",
        },
        photo: {
            id: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
    },
    { timestamps: true }
);

// encrypt password before Save

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
});

// validate the password with passed
userSchema.methods.isValidatedPassword = async function (password) {
    return await bcryptjs.compare(password, this.password);
};

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    });
};

userSchema.methods.getForgotPasswordToken = async function () {
    const forgotToken = crypto.randomBytes(20).toString("hex");

    // getting a hash
    this.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(forgotToken)
        .digest("hex");

    this.forgotPasswordExpiry = Date.now() + 60 * 1000 * 20;
    return forgotToken;
};
export const User = mongoose.model("User", userSchema);
