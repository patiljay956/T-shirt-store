import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";

// for swagger documentation
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

dotenv.config({
    path: "./.env",
});
const app = express();

// use the middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: process.env.CORS,
        credentials: true,
    })
);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./temp/",
    })
);

app.use(
    morgan(":status :method :url  :res[content-length] - :response-time ms")
);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(YAML.load("./swagger.yaml"))
);

// import all routers
import homeRouter from "./routes/home.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";

// use the routers
app.use("/api/v1/", homeRouter);
app.use("/api/v1/user/", userRoutes);
app.use("/api/v1/product/", productRoutes);

export default app;
