import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";
import { isLoggedIn, userRole } from "../middlewares/user.middleware.js";
const router = Router();

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").get(passwordReset);
// authorized user routes
router.route("/userdashboard").get(isLoggedIn, getUserLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

// Role based Routes

router.route("/admin/users").get(isLoggedIn, userRole("admin"), adminAllUser);
router
    .route("/admin/user/:id")
    .get(isLoggedIn, userRole("admin"), adminGetOneUser)
    .put(isLoggedIn, userRole("admin"), adminUpdateUserDetails)
    .delete(isLoggedIn, userRole("admin"), adminDeleteUser);

// Manager based Routes
router
    .route("/manager/users")
    .get(isLoggedIn, userRole("manager"), managerAllUser);

export default router;
