import { User } from "../models/user.model.js";
import { bigPromise } from "../middlewares/bigPromise.middleware.js";
import { cookieToken } from "../utils/cookieToken.js";
import { ApiError } from "../utils/ApiError.js";
import cloudinary from "cloudinary";
import { mailHelper } from "../utils/emailHelper.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";

const signUp = bigPromise(async (req, res) => {
    const { name, email, password } = req.body;

    if (!(name && email && password)) {
        throw new ApiError(400, "missing Field", "all fields are required");
    }

    // checking if the user is already exists by email
    const existsUser = await User.findOne({ email });

    if (existsUser) {
        throw new ApiError(
            400,
            "Authentication Error ",
            `User is already exists with ${email} !!! please login`
        );
    }
    // file upload
    let uploadToCloudinary;
    if (req.files) {
        let file = req.files.photo.tempFilePath;
        uploadToCloudinary = await cloudinary.v2.uploader.upload(file, {
            folder: "TshirtStore/user",
            resource_type: "auto",
            width: 150,
            crop: "scale",
        });

        if (!uploadToCloudinary) {
            throw new ApiError(
                500,
                "file Upload Error",
                "Unable to upload a photo to the cloud"
            );
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: uploadToCloudinary?.public_id,
            url: uploadToCloudinary?.secure_url,
        },
    });
    cookieToken(user, res);
});

const login = bigPromise(async (req, res) => {
    const { email, password } = req.body;

    if (!(email || password)) {
        throw new ApiError(401, "field missing", "all fields are required");
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(
            400,
            "Authentication Error ",
            `User does not exists with ${email} !!! please SignUp`
        );
    }

    // Matching Password
    const isPasswordIsCorrect = await user.isValidatedPassword(password);
    if (!isPasswordIsCorrect) {
        throw new ApiError(
            400,
            "Authentication Error ",
            "Password is incorrect"
        );
    }

    cookieToken(user, res);
});

const logout = bigPromise(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
    });
    res.status(200).json({ success: true, message: "Logout Successful" });
});

// Forgot Password functionality
const forgotPassword = bigPromise(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(401, "field missing", "all fields are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(
            400,
            "Authentication Error ",
            `User does not exists with ${email} !!! please SignUp`
        );
    }

    // Generate forgot password token
    const forgotPasswordToken = await user.getForgotPasswordToken();

    // Save the user without validating before save
    await user.save({ validateBeforeSave: false });

    // Create the forgot password URL
    const forgotUrl = `${req.protocol}://${req.get("host")}/api/v1/user/password/reset/${forgotPasswordToken}`;

    // Create the mail message
    const mailMessage = `Copy and paste this URL to the browser and hit enter: \n\n`;

    try {
        // Send the reset password email
        const sendMail = await mailHelper({
            toEmail: user.email,
            subject: "Tstore Reset Password",
            message: mailMessage,
            url: forgotUrl,
        });
        res.status(200).json(
            new ApiResponse(200, {}, "Email send successfully")
        );
    } catch (error) {
        // If there is an error sending the email, reset the user's forgot password fields
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save({ validateBeforeSave: false });
        throw error;
    }
});

// Password reset functionality
const passwordReset = bigPromise(async (req, res) => {
    const { token } = req.params;

    // Encrypt the token using sha256 algorithm
    const encryptedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    console.log(encryptedToken);

    // Find the user with the matching encrypted token and valid expiry date
    const user = await User.findOne({
        forgotPasswordToken: encryptedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(
            401,
            "Authentication Error ",
            "Token is invalid or expired"
        );
    }

    const { newPassword, confirmPassword } = req.body;

    // Check if the new password and confirm password match
    if (newPassword != confirmPassword && !(newPassword && confirmPassword)) {
        throw new ApiError(
            401,
            "Field Error ",
            "Both the password must be matched"
        );
    }

    // Update the user's password and reset the forgot password fields
    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    res.status(201).json({
        success: true,
        message: "Password has been successfully reset ",
    });
});

const getUserLoggedInUserDetails = bigPromise(async (req, res) => {
    const user = await User.findById(req.user?.id);
    if (!user) {
        throw new ApiError(401, "Unauthorized request", "You must logged ");
    }
    res.status(200).json({ success: true, user });
});

const changePassword = bigPromise(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(400, "Unauthorized request", "You must login first");
    }

    const user = await User.findById(userId).select("+password");

    const isPasswordIsCorrect = await user.isValidatedPassword(
        req.body.oldPassword
    );

    if (!isPasswordIsCorrect) {
        throw new ApiError(
            401,
            "Password Mismatch",
            "old password is incorrect"
        );
    }

    user.password = req.body.newPassword;
    await user.save();
    cookieToken(user, res);
});

const updateUserDetails = bigPromise(async (req, res) => {
    const newData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (req.files?.photo) {
        const user = await User.findById(req.user._id);
        const imageId = user.photo.id;

        // delete old photo
        await cloudinary.v2.uploader.destroy(imageId);

        let file = req.files.photo?.tempFilePath;
        const uploadToCloudinary = await cloudinary.v2.uploader.upload(file, {
            folder: "TshirtStore/user",
            width: 150,
            crop: "scale",
        });

        newData.photo = {
            id: uploadToCloudinary.public_id,
            url: uploadToCloudinary.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user?._id, newData, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        throw new ApiError(
            500,
            "Data Updating Error",
            "unable to update data or You must login first"
        );
    }

    res.status(201).json({
        success: true,
        message: "user data updated successfully",
        user,
    });
});

// admin
const adminAllUser = bigPromise(async (req, res) => {
    const users = await User.find();
    res.status(200).json({ success: true, message: "All users found", users });
});

const adminGetOneUser = bigPromise(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(401, "user fetch error", "No found user");
    }
    res.status(201).json({
        success: true,
        message: "user fetched successfully",
        user,
    });
});

const adminUpdateUserDetails = bigPromise(async (req, res) => {
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        throw new ApiError(
            500,
            "Data Updating Error",
            "unable to update data or You must login first"
        );
    }

    res.status(201).json({
        success: true,
        message: "user data updated by admin successfully",
        user,
    });
});

const adminDeleteUser = bigPromise(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new ApiError(
                404,
                "admin user fetch Error",
                "unable to get the user"
            );
        }

        // delete the cloudinary file
        if (user.photo && user.photo.id) {
            await cloudinary.v2.uploader.destroy(user.photo.id);
        }
        // it is not working
        // await user.remove(); // delete user
        await User.findByIdAndDelete(user._id);
        res.status(200).json({
            success: true,
            message: "user has been deleted",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// manager
const managerAllUser = bigPromise(async (req, res) => {
    const users = await User.find({ role: "user" });
    if (!users) {
        throw new ApiError(500, "Data fetching Error", "Users not found");
    }
    res.status(200).json({ success: true, message: "users found", users });
});

export {
    signUp,
    login,
    logout,
    forgotPassword,
    passwordReset,
    getUserLoggedInUserDetails,
    changePassword,
    updateUserDetails,
    adminAllUser,
    managerAllUser,
    adminGetOneUser,
    adminUpdateUserDetails,
    adminDeleteUser,
};
