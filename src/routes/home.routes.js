import { Router } from "express";
import { homeController } from "../controllers/home.controller.js";
const router = Router();

router.route("/").get(homeController);

export default router;
