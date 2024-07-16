import { Router } from "express";
import {
    adminDeleteOneProduct,
    adminGetAllProducts,
    adminUpdateOneProduct,
    createProduct,
    getAllProduct,
    getSingleProduct,
    addReview,
    deleteReview,
    getOnlyReviewsForOneProduct,
} from "../controllers/products.controller.js";

import { isLoggedIn, userRole } from "../middlewares/user.middleware.js";

const router = Router();
// router.route("/test").get(testRoute);
router.route("/get-products").get(getAllProduct);
router.route("/:id").get(getSingleProduct);
router
    .route("/reviews/:id")
    .get(getOnlyReviewsForOneProduct)
    .put(isLoggedIn, addReview)
    .delete(isLoggedIn, deleteReview); //TODO: test this route

// admin
router.route("/admin/add").post(isLoggedIn, userRole("admin"), createProduct);
router
    .route("/admin/get-products")
    .get(isLoggedIn, userRole("admin"), adminGetAllProducts);

router
    .route("/admin/:id")
    .put(isLoggedIn, userRole("admin"), adminUpdateOneProduct) //put is a type of req that change the entire doc
    .delete(isLoggedIn, userRole("admin"), adminDeleteOneProduct);
export default router;
