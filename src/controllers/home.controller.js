import { bigPromise } from "../middlewares/bigPromise.middleware.js";

const homeController = bigPromise(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the home page",
    });
});
export { homeController };
