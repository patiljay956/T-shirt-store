import { bigPromise } from "../middlewares/bigPromise.middleware.js";
import { Product } from "../models/product.model.js";
import cloudinary from "cloudinary";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { whereClause } from "../utils/whereClause.js";

const createProduct = bigPromise(async (req, res) => {
    let photosArray = [];

    if (!req.files) {
        throw new ApiError(401, "missing Field Error ", "Please upload photos");
    }
    // console.log(req.files.photos);

    if (req.files) {
        for (let i = 0; i < req.files.photos.length; i++) {
            const result = await cloudinary.v2.uploader.upload(
                req.files.photos[i].tempFilePath,
                {
                    folder: "TshirtStore/Products",
                }
            );

            photosArray.push({ id: result.public_id, url: result.secure_url });
        }
    }

    const { name, price, description, category, brand } = req.body;

    const user = req.user?.id;

    if (!name || !price || !description || !category || !brand) {
        throw new ApiError(400, "missing Field", "all fields are required");
    }

    if (!user) {
        throw new ApiError(401, "Unauthorized access", "You must log in");
    }

    try {
        const product = await Product.create({
            name,
            price,
            description,
            photos: photosArray,
            category,
            brand,
            user,
        });

        if (!product) {
            throw new ApiError(500, "product error", "Product is not created");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, product, "Product created successfully")
            );
    } catch (error) {
        console.log(error);
    }
});

const getAllProduct = bigPromise(async (req, res) => {
    const resultPerPage = 6;
    const totalCountProduct = await Product.countDocuments();

    const productsObj = await new whereClause(Product.find({}), req.query)
        .search()
        .filter();

    let products = await productsObj.base;
    // let products = productsObj.base;
    const filteredProductNumber = productsObj.length;

    if (!products) {
        throw new ApiError(
            500,
            "product fetched error",
            "unable to get products"
        );
    }

    // products().limit().skip()
    productsObj.pager(resultPerPage);
    products = await productsObj.base.clone();

    return res.status(201).json({
        success: true,
        products,
        totalCountProduct,
        filteredProductNumber,
        message: "all products fetched successfully",
    });
});

const getSingleProduct = bigPromise(async (req, res) => {
    const product = await Product.findById(req.params.id);
    console.log(product);
    if (!product) {
        throw new ApiError(500, "fetch error", "No product found with this id");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "product fetched successfully"));
});

const addReview = bigPromise(async (req, res) => {
    const review = {
        user: req.user._id,
        name: req.user.name,
        product: req.params.id,
        rating: Number(req.body.rating),
        comment: req.body.comment,
    };

    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError(404, "Product not found", "Product not found");
    }

    const alreadyReviewed = product.reviews.find(
        // check each review if the user has already reviewed the product
        // if the user has already reviewed the product, then the user updates review the product again
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    try {
        if (alreadyReviewed) {
            product.reviews.forEach((rev) => {
                if (rev.user.toString() === req.user._id.toString()) {
                    rev.name = review.name;
                    rev.rating = review.rating;
                    rev.comment = review.comment;
                }
            });
        } else {
            product.reviews.push(review);
            product.numberOfRevives = product.reviews.length;
        }

        product.ratings =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();

        return res.status(201).json({
            success: true,
            message: "Review added",
        });
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Review error", "Review not added");
    }
});

const deleteReview = bigPromise(async (req, res) => {
    // Find the product by its ID
    const product = await Product.findById(req.params.id);

    // If the product is not found, throw an error
    if (!product) {
        throw new ApiError(404, "Fetch error", "Product not found");
    }

    // Find the index of the review made by the current user
    const reviewIndex = product.reviews.findIndex(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    // If the review is not found, throw an error
    if (reviewIndex === -1) {
        throw new ApiError(404, "Review not found", "Unable to find review");
    }

    // Remove the review from the array
    product.reviews.splice(reviewIndex, 1);

    // Update the number of reviews
    product.numberOfRevives = product.reviews.length;

    // Calculate the new average rating, handle the case when there are no reviews left
    if (product.reviews.length > 0) {
        product.ratings =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;
    } else {
        product.ratings = 0; // No reviews left, so set ratings to 0
    }

    // Save the updated product
    const updateProduct = await product.save();

    // If the product update fails, throw an error
    if (!updateProduct) {
        throw new ApiError(500, "Update error", "Unable to update product");
    }

    // Return a success response
    return res.status(200).json({
        success: true,
        message: "Review deleted",
        data: updateProduct,
    });
});

const getOnlyReviewsForOneProduct = bigPromise(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError(404, "Fetch error", "Product not found");
    }

    res.status(200).json({
        success: true,
        data: product.reviews,
    });
});

const adminGetAllProducts = bigPromise(async (req, res) => {
    const products = await Product.find({});

    if (!products) {
        throw new ApiError(500, "fetch error", "unable to fetch products ");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, products, "products fetched successfully"));
});

const adminUpdateOneProduct = bigPromise(async (req, res) => {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(500, "fetch error", "unable to fetch products ");
    }

    if (req.files) {
        // delete old pics
        let imagesArray = [];
        try {
            for (let index = 0; index < product.photos.length; index++) {
                const result = await cloudinary.v2.uploader.destroy(
                    product.photos[index].id
                );
            }
        } catch (error) {
            console.log("error while destroying images");
            throw error;
        }

        // upload new pics

        for (let i = 0; i < req.files.photos.length; i++) {
            const result = await cloudinary.v2.uploader.upload(
                req.files.photos[i].tempFilePath,
                {
                    folder: "TshirtStore/Products",
                }
            );

            imagesArray.push({
                id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.photos = imagesArray;
    }
    // save to database
    const { name, price, description, category, brand } = req.body;

    const user = req.user?.id;

    if (!(name || price || description || category || brand)) {
        throw new ApiError(400, "missing Field", "all fields are required");
    }

    if (!user) {
        throw new ApiError(401, "Unauthorized access", "You must log in");
    }

    const updateProduct = await Product.findByIdAndUpdate(
        productId,
        {
            name,
            price,
            description,
            photos: req.body?.photos,
            category,
            brand,
            user,
        },
        { new: true }
    );

    if (!updateProduct) {
        throw new ApiError(500, "save error", "unable to update product ");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, updateProduct, "product has been updated"));
});

const adminDeleteOneProduct = bigPromise(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError(
            400,
            "fetch error",
            "unable to find the Product with this id"
        );
    }

    // deleting the files from the cloudinary
    try {
        for (let index = 0; index < product.photos.length; index++) {
            await cloudinary.v2.uploader.destroy(product.photos[index].id);
        }
    } catch (error) {
        console.log("error while destroying images");
        throw error;
    }

    const deleteProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deleteProduct) {
        throw new ApiError(500, "delete error", "unable to remove product");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deleteProduct, "Product deleted"));
});

export {
    createProduct,
    getAllProduct,
    getSingleProduct,
    addReview, //
    deleteReview, //
    getOnlyReviewsForOneProduct, //
    adminGetAllProducts,
    adminUpdateOneProduct,
    adminDeleteOneProduct,
};
