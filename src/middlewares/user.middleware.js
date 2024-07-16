import { User } from "../models/user.model.js";
import { bigPromise } from "./bigPromise.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const isLoggedIn = bigPromise(async (req, res, next) => {
    const token =
        req.cookies.token ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(
            401,
            "Unauthorized Request",
            "Unauthorized Access or You must Logged in "
        );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
        throw new ApiError(
            401,
            "Unauthorized Request",
            "Unauthorized Access or You must Logged in "
        );
    }

    req.user = user;
    next();
});

const userRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            throw new ApiError(
                403,
                "Unauthorized Request",
                "Unauthorized Access!!! You are not allowed to access this resource."
            );
        }
        next();
    };
};

export { isLoggedIn, userRole };
